import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";
import wasm from "vite-plugin-wasm";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import { metadataPlugin } from "./vite-metadata-plugin";

const getRecentGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Failed to get Git commit hash", error);
    return "unknown";
  }
};

const generateBuildIdFile = () => {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const buildIdPath = path.resolve(__dirname, "public/build-id.json");
  fs.writeFileSync(buildIdPath, JSON.stringify({ buildId }, null, 2));
};

const buildId = getRecentGitCommitHash();

// https://vitejs.dev/config/
export default defineConfig({
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
    {
      name: "generate-build-id",
      buildEnd() {
        generateBuildIdFile();
      },
      configureServer(server) {
        generateBuildIdFile();
        // Have to write a custom middleware to serve the build Id file,
        // because vite dev server doesn't serve files from public directory as soon as they are generated.
        server.middlewares.use((req, res, next) => {
          if (req.url === "/build-id.json") {
            const buildIdPath = path.resolve(
              path.dirname(new URL(import.meta.url).pathname),
              "public/build-id.json"
            );
            fs.readFile(buildIdPath, (err, data) => {
              if (err) {
                res.statusCode = 404;
                res.end("Build ID not found");
              } else {
                res.setHeader("Content-Type", "application/json");
                res.end(data);
              }
            });
          } else {
            next();
          }
        });
      },
    },
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
    sentryVitePlugin({
      org: "garden",
      project: "kiosk",
      url: "https://telemetry.garden.finance/",
    }),
  ],
  build: {
    target: "esnext",
    sourcemap: true,
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
  define: {
    "process.env.BUILD_ID": JSON.stringify(buildId),
    "process.version": JSON.stringify("v18.16.1"),
  },
});
