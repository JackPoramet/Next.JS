import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Ignore seed files and migration scripts
      "src/db/seeds/**",
      "scripts/**",
      "migrations/**",
      // Ignore build outputs
      ".next/",
      "out/",
      "dist/",
      // Ignore config files
      "next.config.ts",
      "tailwind.config.ts",
      "postcss.config.mjs",
      // Ignore test files
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx"
    ]
  },
  {
    rules: {
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      // Allow any type in specific contexts
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow require imports in specific files
      "@typescript-eslint/no-require-imports": "warn"
    }
  }
];

export default eslintConfig;
