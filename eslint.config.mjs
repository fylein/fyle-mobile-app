import { defineConfig, globalIgnores } from "eslint/config";
import maxParamsNoConstructor from "eslint-plugin-max-params-no-constructor";
import customRules from "eslint-plugin-custom-rules";
import fyle from "@fyle/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "projects/**/*",
    "**/zone-flags.ts",
    "**/test.ts",
    "**/main.ts",
    "eslint-custom-rules/**/*",
    "ios/**/*.entitlements",
]), {
    plugins: {
        "max-params-no-constructor": maxParamsNoConstructor,
        "custom-rules": customRules,
        "@fyle": fyle,
    },

    languageOptions: {
        globals: {},
    },
}, {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.e2e-spec.ts", "**/*.po.ts"],

    extends: compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended"
    ),

    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@angular-eslint/component-class-suffix": ["error", {
            suffixes: ["Page", "Component"],
        }],

        "@typescript-eslint/naming-convention": ["off", {
            selector: "variable",
            format: ["camelCase"],
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
        "@typescript-eslint/explicit-function-return-type": ["error"],
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/no-explicit-any": ["error"],
        "@typescript-eslint/no-empty-function": ["error", { "allow": [] }],
        "@typescript-eslint/no-empty-interface": ["error"],
        "@typescript-eslint/no-inferrable-types": ["error"],
        "no-unused-expressions": ["error"],

        "no-console": ["error", {
            allow: [""],
        }],

        "custom-rules/one-interface-per-file": "error",
        "custom-rules/one-enum-per-file": "error",
        "custom-rules/prefer-semantic-extension-name": "error",
        "@fyle/i18n-key-naming-convention": "error",
        "@fyle/no-hardcoded-strings": "warn",
    },
}, {
    files: ["**/*.html"],
    extends: compat.extends("plugin:@angular-eslint/template/recommended"),

    rules: {
        "@angular-eslint/template/no-negated-async": "off",
        "@fyle/i18n-key-naming-convention": "error",
        "@fyle/no-hardcoded-strings": "warn",
    },
}, {
    files: ["**/*.data.ts"],

    rules: {
        "custom-rules/prefer-deep-freeze": "error",
    },
}, {
    files: ["**/*.spec.ts"],
    extends: compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended"
    ),

    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
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
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "no-unused-expressions": "off",
        "custom-rules/space-before-it-blocks": "error",
        "custom-rules/prefer-jasmine-matchers": "error",
        "custom-rules/prefer-resolve-to-reject-with": "error",
    },
}]);