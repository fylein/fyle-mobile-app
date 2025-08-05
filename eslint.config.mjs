import { defineConfig, globalIgnores } from "eslint/config";
import maxParamsNoConstructor from "eslint-plugin-max-params-no-constructor";
import customRules from "eslint-plugin-custom-rules";
import fyle from "@fyle/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import diff from "eslint-plugin-diff";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores([
    "projects/**/*",
    "**/zone-flags.ts",
    "**/test.ts",
    "**/main.ts",
    "eslint-custom-rules/**/*",
    "ios/**/*.entitlements",
  ]),
  {
    plugins: {
      diff: diff,
    },
    processor: diff.processors.diff,
  },
  {
    plugins: {
      "max-params-no-constructor": maxParamsNoConstructor,
      "custom-rules": customRules,
      "@fyle": fyle,
    },
    languageOptions: {
      globals: {},
    },
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.e2e-spec.ts", "**/*.po.ts"],
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:@angular-eslint/recommended"
    ),
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.app.json"],
        createDefaultProgram: true,
      },
    },
    rules: {
      // Angular-specific rules (not covered by TypeScript)
      "@angular-eslint/component-class-suffix": ["error", {
        suffixes: ["Page", "Component"],
      }],
      "@angular-eslint/component-selector": ["error", {
        type: "element",
        prefix: "app",
        style: "kebab-case",
      }],
      "@angular-eslint/directive-selector": ["error", {
        type: "attribute",
        prefix: "app",
      }],
      "@angular-eslint/prefer-standalone": "warn",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/prefer-inject": "error",
      "@angular-eslint/no-uncalled-signals": "error",
      // Code style and formatting (not covered by TypeScript)
      indent: "off",
      semi: "error",
      "no-underscore-dangle": "off",
      "@angular-eslint/template/no-negated-async": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "prefer-arrow/prefer-arrow-functions": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@angular-eslint/no-conflicting-lifecycle": "off",
      "lines-between-class-members": ["error", "always"],
      "@typescript-eslint/no-shadow": "off",
      complexity: [2, 10],
      "max-depth": ["error", 4],
      "max-params-no-constructor/max-params-no-constructor": ["error", 4],
      "max-len": "off",
      "space-before-function-paren": "off",
      "@typescript-eslint/quotes": "off",
      // TypeScript rules that add value beyond strict mode (no type checking required)
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-empty-function": ["error", { "allow": [] }],
      "@typescript-eslint/no-empty-interface": ["error"],
      "@typescript-eslint/no-inferrable-types": ["error"],
      "@typescript-eslint/no-var-requires": ["error"],
      "@typescript-eslint/no-array-constructor": ["error"],
      "@typescript-eslint/no-duplicate-enum-values": ["error"],
      "@typescript-eslint/no-extra-non-null-assertion": ["error"],
      "@typescript-eslint/no-misused-new": ["error"],
      "@typescript-eslint/no-namespace": ["error"],
      "@typescript-eslint/no-non-null-asserted-optional-chain": ["error"],
      "@typescript-eslint/no-this-alias": ["error"],
      "@typescript-eslint/no-unnecessary-type-constraint": ["error"],
      "@typescript-eslint/no-unsafe-declaration-merging": ["error"],
      "@typescript-eslint/prefer-as-const": ["error"],
      "@typescript-eslint/prefer-function-type": ["error"],
      "@typescript-eslint/prefer-literal-enum-member": ["error"],
      "@typescript-eslint/prefer-ts-expect-error": ["error"],
      "no-unused-expressions": ["error"],
      // TypeScript safety rules
      "@typescript-eslint/no-unsafe-call": ["error"],
      "@typescript-eslint/no-unsafe-member-access": ["error"],
      "@typescript-eslint/no-unsafe-assignment": ["error"],
      "@typescript-eslint/no-unsafe-return": ["error"],
      "@typescript-eslint/no-unsafe-argument": ["error"],
      "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
      "@typescript-eslint/no-explicit-any": ["error"],
      // Naming convention rule
      "@typescript-eslint/naming-convention": ["off", {
        "selector": "variable",
        "format": ["camelCase"]
      }],
      // JSDoc rule
      "jsdoc/newline-after-description": "off",
      // Console and logging rules
      "no-console": ["error", {
        allow: [""],
      }],
      // Custom project rules
      "custom-rules/one-interface-per-file": "error",
      "custom-rules/one-enum-per-file": "error",
      "custom-rules/prefer-semantic-extension-name": "error",
      "@fyle/i18n-key-naming-convention": "error",
      "@fyle/no-hardcoded-strings": "warn",
    },
  },
  {
    files: ["**/*.html"],
    extends: compat.extends("plugin:@angular-eslint/template/recommended"),
    rules: {
      "@angular-eslint/template/no-negated-async": "off",
      "@fyle/i18n-key-naming-convention": "error",
      "@fyle/no-hardcoded-strings": "warn",
    },
  },
  {
    files: ["**/*.data.ts"],
    rules: {
      "custom-rules/prefer-deep-freeze": "error",
    },
  },
  {
    files: ["**/*.spec.ts"],
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:@angular-eslint/recommended"
    ),
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.spec.json"],
        createDefaultProgram: true,
      },
    },
    rules: {
      "@angular-eslint/component-class-suffix": "off",
      "@typescript-eslint/naming-convention": "off",
      "@angular-eslint/component-selector": "off",
      "@angular-eslint/directive-selector": "off",
      indent: "off",
      semi: "off",
      "no-underscore-dangle": "off",
      "@angular-eslint/template/no-negated-async": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "prefer-arrow/prefer-arrow-functions": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@angular-eslint/no-conflicting-lifecycle": "off",
      "lines-between-class-members": "off",
      "@typescript-eslint/no-shadow": "off",
      complexity: "off",
      "max-depth": "off",
      "max-params-no-constructor/max-params-no-constructor": "off",
      "max-len": "off",
      "space-before-function-paren": "off",
      "@typescript-eslint/quotes": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "no-unused-expressions": "off",
      // TypeScript safety rules (turned off for test files)
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // JSDoc rule (turned off for test files)
      "jsdoc/newline-after-description": "off",
      "custom-rules/space-before-it-blocks": "error",
      "custom-rules/prefer-jasmine-matchers": "error",
      "custom-rules/prefer-resolve-to-reject-with": "error",
    },
  },
]);