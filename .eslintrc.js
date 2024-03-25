module.exports = {
  extends: [
    "@opencast/eslint-config-ts-react",
  ],
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
