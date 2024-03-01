import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
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
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
