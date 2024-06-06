import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint";
import child from "child_process";

const commitHash = child.execSync("git rev-parse HEAD").toString().trim();

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: process.env.PUBLIC_URL || "",
    server: {
      open: true,
    },
    build: {
      outDir: "build",
    },
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      // svgr options: https://react-svgr.com/docs/options/
      svgr({ svgrOptions: { } }),
      eslint(),
    ],
    // Workaround, see https://github.com/vitejs/vite/discussions/5912#discussioncomment-6115736
    define: {
      global: "globalThis",
      'import.meta.env.VITE_GIT_COMMIT_HASH': JSON.stringify(commitHash),
      'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(new Date().toISOString()),
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
