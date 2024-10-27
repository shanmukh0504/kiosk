import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";
import wasm from "vite-plugin-wasm";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";

const getRecentGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Failed to get Git commit hash", error);
    return "unknown";
  }
};

const generateBuildIdFile = () => {
  const buildIdPath = path.resolve(__dirname, "public/build-id.json");
  fs.writeFileSync(buildIdPath, JSON.stringify({ buildId }, null, 2));
};

const buildId = getRecentGitCommitHash();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
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
          src: path.resolve(__dirname, "build-id.json"), // Use path.resolve to resolve the file path
          dest: "public",
        },
      ],
    }),
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
            const buildIdPath = path.resolve(__dirname, "public/build-id.json");
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
  ],
  define: {
    "process.env.BUILD_ID": JSON.stringify(buildId),
  },
});
