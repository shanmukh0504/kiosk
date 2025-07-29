import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import wasm from "vite-plugin-wasm";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import { metadataPlugin } from "./vite-metadata-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`Running in ${mode} mode`);
  return {
    plugins: [
      react(),
      wasm(),
      metadataPlugin(),
      nodePolyfills({
        globals: {
          process: true,
          Buffer: true,
          global: true,
        },
      }),
      topLevelAwait(),
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(
              path.dirname(new URL(import.meta.url).pathname),
              "build-id.json"
            ),
            dest: "public",
          },
        ],
      }),
    ],
    build: {
      target: "esnext",
      sourcemap: false,
      minify: "terser",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "ui-vendor": ["@gardenfi/garden-book", "framer-motion"],
            "wallet-vendor": ["@gardenfi/wallet-connectors", "wagmi", "viem"],
          },
        },
      },
    },
    preview: {
      allowedHosts: true,
    },
  };
});
