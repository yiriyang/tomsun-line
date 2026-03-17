import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^tomsun-line$/,
        replacement: path.resolve(__dirname, "../../src/index.ts"),
      },
      {
        find: /^tomsun-line\/adapters\/React$/,
        replacement: path.resolve(
          __dirname,
          "../../src/adapters/React/index.ts",
        ),
      },
      {
        find: /^tomsun-line\/core\/types$/,
        replacement: path.resolve(__dirname, "../../src/core/types.ts"),
      },
    ],
  },
});
