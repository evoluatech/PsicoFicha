import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

export default defineConfig(
  {
    ignores: ["dist/**/*", ".next/**/*"]
  },
  ...next,
  firebaseRulesPlugin.default ? firebaseRulesPlugin.default.configs["flat/recommended"] : firebaseRulesPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
