import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/web",
  base: "",
  build: {
    target: ["esnext"],
    sourcemap: true,
    outDir: "../../dist"
  },
});
