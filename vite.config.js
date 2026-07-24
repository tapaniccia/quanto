import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build also works from a GitHub Pages project subpath
  // (e.g. https://username.github.io/quanto/) without extra config.
  base: "./",
});
