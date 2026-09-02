import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // خدمة Python منفصلة كليًا — بيئتها الافتراضية (venv) فيها ملفات JS
    // مجمّعة جوا مكتباتها (زي أدوات torch) ما إلها علاقة بمشروعنا.
    "ai-service/**",
  ]),
]);

export default eslintConfig;
