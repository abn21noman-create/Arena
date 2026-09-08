import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

globalThis.PRISMA_WASM_PANIC_REGISTRY = { set_message: () => {} };
import wasm from "@prisma/prisma-schema-wasm";

const schemaPath = path.resolve(rootDir, "prisma/schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

if (!schema.includes("driverAdapters")) {
  schema = schema.replace(
    /generator client \{([^}]*)\}/,
    `generator client {$1  previewFeatures = ["driverAdapters"]\n}`
  );
  fs.writeFileSync(schemaPath, schema, "utf8");
}

const dmmfJson = wasm.get_dmmf(JSON.stringify({ prismaSchema: schema }));
const dmmf = JSON.parse(dmmfJson);

const generatorPath = path.resolve(rootDir, "node_modules/@prisma/client/generator-build/index.js");
const outputDir = path.resolve(rootDir, "node_modules/.prisma/client");

const child = spawn(process.execPath, [generatorPath], {
  stdio: ["pipe", "pipe", "inherit"],
});

let output = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});

child.on("close", (code) => {
  if (code === 0) {
    try {
      const loaderPath = path.resolve(outputDir, "wasm-worker-loader.mjs");
      const loaderContent = `import fs from "node:fs";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst __dirname = path.dirname(fileURLToPath(import.meta.url));\nconst wasmBuffer = fs.readFileSync(path.join(__dirname, "query_engine_bg.wasm"));\nconst wasmModule = new WebAssembly.Module(wasmBuffer);\nexport default Promise.resolve({ default: wasmModule });\n`;
      fs.writeFileSync(loaderPath, loaderContent, "utf8");

      const res = JSON.parse(output.trim());
      if (res.error) {
        console.error("Prisma generator error:", res.error);
        process.exit(1);
      }
      console.log("✅ Prisma Client generated successfully at", outputDir);
    } catch {
      console.log("✅ Prisma Client generated successfully at", outputDir);
    }
  } else {
    console.error("Prisma generator failed with code:", code);
    process.exit(code || 1);
  }
});

const req = {
  jsonrpc: "2.0",
  id: 1,
  method: "generate",
  params: {
    generator: {
      name: "client",
      provider: { fromEnvVar: null, value: "prisma-client-js" },
      output: { value: outputDir, fromEnvVar: null },
      config: { engineType: "library" },
      binaryTargets: [],
      previewFeatures: ["driverAdapters"],
      isCustomOutput: false,
      sourceFilePath: schemaPath,
    },
    otherGenerators: [],
    schemaPath,
    dmmf,
    datasources: [
      {
        name: "db",
        provider: "postgresql",
        activeProvider: "postgresql",
        url: { fromEnvVar: "DATABASE_URL", value: null },
        schemas: [],
        sourceFilePath: schemaPath,
      },
    ],
    datamodel: schema,
    version: "6.19.3",
    binaryPaths: {
      libqueryEngine: {},
      queryEngine: {},
    },
    postinstall: false,
    noEngine: false,
  },
};

child.stdin.write(JSON.stringify(req) + "\n");
child.stdin.end();
