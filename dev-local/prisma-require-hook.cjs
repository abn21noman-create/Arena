// ===================================================================
// CommonJS require hook: redirects "@prisma/client" to the local shim.
// Usage: NODE_OPTIONS="--require /home/user/Arena/dev-local/prisma-require-hook.cjs" ...
// ===================================================================
"use strict";

const Module = require("node:module");

const SHIM = process.env.ARENA_SHIM || "/home/user/Arena/dev-local/prisma-client-shim.cjs";

const REDIRECTS = new Set([
  "@prisma/client",
  "@prisma/client/default",
  "@prisma/client/default.js",
  "@prisma/client/index",
  "@prisma/client/index.js",
]);

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
  if (REDIRECTS.has(request)) return SHIM;
  return originalResolve.call(this, request, ...rest);
};
