import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // স্ট্যান্ডার্ড async data-fetching pattern (useEffect এর ভেতরে async ফাংশন কল
      // করে loading/data state সেট করা) এ false positive দিচ্ছে, তাই off করা হলো।
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "**/build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
