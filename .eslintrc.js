module.exports = {
  extends: [
    "@opencast/eslint-config-ts-react",
    "react-app/jest",
  ],
  rules: {

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
