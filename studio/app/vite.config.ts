import { defineConfig } from "vite";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../..");
export default defineConfig({
  root: import.meta.dirname,
  base: "/_qa/workspace/",
  resolve: {
    alias: {
      "three/addons": path.join(root, "node_modules/three/examples/jsm"),
      three: path.join(root, "dist/vendor/three/build/three.module.js"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
    fs: { allow: [root] },
    proxy: {
      "/art": { target: "http://127.0.0.1:4174" },
      "/textures": { target: "http://127.0.0.1:4174" },
    },
  },
  build: {
    rollupOptions: {
      input: {
        workspace: path.join(import.meta.dirname, "index.html"),
        parity: path.join(import.meta.dirname, "parity.html"),
        explore: path.join(import.meta.dirname, "explore.html"),
      },
    },
    outDir: path.join(root, "local-qa/site/workspace"),
    emptyOutDir: true,
  },
});
