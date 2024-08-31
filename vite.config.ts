import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path"; // Import the path module
import fs from "fs";

const getRecentGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Failed to get Git commit hash", error);
    return "unknown";
  }
};

const buildId = getRecentGitCommitHash();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "build-id.json"), // Use path.resolve to resolve the file path
          dest: "public",
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      plugins: [
        {
          name: "generate-build-id",
          buildEnd() {
            fs.writeFileSync(
              path.resolve(__dirname, "public/build-id.json"), // Use path.resolve to resolve the file path
              JSON.stringify({ buildId }, null, 2),
            );
          },
        },
      ],
    },
  },
});
