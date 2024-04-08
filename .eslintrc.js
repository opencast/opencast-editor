module.exports = {
  extends: [
    "@opencast/eslint-config-ts-react",
  ],
  rules: {
    // Currently 120 warnings.
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["./*.js"],
      env: {
        node: true,
      },
    },
    {
      files: ["./*.ts", "tests/**"],
      parserOptions: {
        project: false,
      },
    },
  ],
};
