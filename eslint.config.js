import opencastConfig from "@opencast/eslint-config-ts-react";

export default [
  ...opencastConfig,

  // Fully ignore some files
  {
    ignores: ["build/", "**/*.js", "*.ts", "tests/**"],
  },

  {
    rules: {
      // // TODO: We want to turn these on eventually
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
];
