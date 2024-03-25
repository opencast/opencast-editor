module.exports = {
  extends: [
    "@opencast/eslint-config-ts-react",
    "react-app/jest",
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
