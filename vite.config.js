import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/hms/", // Updated to match your project path
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"), // Ensure this path is correct
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api", "mixed-decls", "color-functions"],
      },
    },
  },
  server: {
    hmr: {
      overlay: false, // TEMPORARY: hides the error popup in browsers
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000, // used later when you switch to "vite preview"
  },
});