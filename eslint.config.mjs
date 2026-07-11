import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import cypress from "eslint-plugin-cypress";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    globalIgnores(["**/databaseTypesFile.ts"]),
    {
        extends: fixupConfigRules(
            compat.extends(
                "eslint:recommended",
                "next",
                "next/core-web-vitals",
                "plugin:prettier/recommended",
                "plugin:cypress/recommended",
                "plugin:import/recommended",
                "plugin:import/typescript",
                "plugin:@typescript-eslint/recommended",
                "prettier"
            )
        ),

        plugins: {
            react,
            prettier: fixupPluginRules(prettier),
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
            cypress: fixupPluginRules(cypress),
        },

        rules: {
            quotes: ["error", "double"],
            "prefer-const": "error",

            "@typescript-eslint/explicit-function-return-type": [
                "error",
                {
                    allowExpressions: true,
                },
            ],

            "react/react-in-jsx-scope": "off",
            curly: "error",
            "react/jsx-curly-brace-presence": "error",

            "id-length": [
                "error",
                {
                    exceptions: ["_"],
                },
            ],

            "import/no-named-as-default": "off",
            "import/no-self-import": "warn",
            // to deal with false positives in type annotations, turn on typescript-specific rules
            "no-unused-vars": "off",

            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],

            "react/jsx-key": "error",
            "react/no-array-index-key": "error",
        },
    },
]);
