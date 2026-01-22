import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";
import wasm from "vite-plugin-wasm";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import { frameMetadataPlugin, metadataPlugin } from "./vite-metadata-plugin";
import process from "process";

const getRecentGitCommitHash = () => {
  try {
    // Try to get from environment variable first (Docker build)
    if (process.env.SOURCE_COMMIT) {
      return process.env.SOURCE_COMMIT.substring(0, 7);
    }
    // Fallback to git command
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.warn("Failed to get Git commit hash, using fallback", error);
    // Use timestamp as fallback
    return `build-${Date.now().toString(36)}`;
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
    frameMetadataPlugin(),
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
      configureServer(server: {
        middlewares: {
          use: (arg0: (req: any, res: any, next: any) => void) => void;
        };
      }) {
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
  ],
  esbuild: {
    target: "esnext",
    treeShaking: true,
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: false,
  },
  build: {
    target: "esnext",
    sourcemap: false,
    minify: "esbuild",
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION'
        ) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          libs: [
            "@gardenfi/garden-book",
            "framer-motion",
            "@gardenfi/wallet-connectors",
          ],
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
