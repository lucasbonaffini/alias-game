const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        io: "readonly",
      },
    },
  },
  {
    ...pluginJs.configs.recommended,
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^next$" }],
    },
  },
];

