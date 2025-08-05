// vite.config.ts
import { sentryVitePlugin } from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { defineConfig } from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/vite/dist/node/index.js";
import react from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/@vitejs/plugin-react/dist/index.js";
import { execSync } from "child_process";
import { viteStaticCopy } from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/vite-plugin-static-copy/dist/index.js";
import path2 from "path";
import fs2 from "fs";
import wasm from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/vite-plugin-wasm/exports/import.mjs";
import { nodePolyfills } from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/vite-plugin-node-polyfills/dist/index.js";
import topLevelAwait from "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/node_modules/vite-plugin-top-level-await/exports/import.mjs";

// vite-metadata-plugin.ts
import fs from "fs";
import path from "path";
function metadataPlugin() {
  let config;
  return {
    name: "vite-metadata-plugin",
    enforce: "post",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        if (!req.url.endsWith(".html") && !req.headers.accept?.includes("text/html")) {
          return next();
        }
        const route = req.url === "/" ? "/" : req.url.split("?")[0] || "/";
        const metadata = generatePageMetadata(route);
        const originalHtml = await server.transformIndexHtml(
          req.url,
          fs.readFileSync(path.join(config.root, "index.html"), "utf-8")
        );
        const html = originalHtml.replace(/<!--meta-title-->/g, metadata.title).replace(/<!--meta-og-title-->/g, metadata.title).replace(/<!--meta-description-->/g, metadata.description).replace(/<!--meta-og-description-->/g, metadata.description).replace(/<!--meta-og-image-->/g, metadata.ogImage).replace(/<!--meta-twt-image-->/g, metadata.ogImage).replace(/<!--meta-keywords-->/g, metadata.keywords.join(", ")).replace(/<!--meta-canonical-->/g, metadata.canonical);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });
    },
    closeBundle() {
      if (config.command === "build") {
        const template = fs.readFileSync(
          path.join(config.build.outDir, "index.html"),
          "utf-8"
        );
        const isTestnet = config.env.VITE_NETWORK === "testnet";
        const routesToPrerender = isTestnet ? ["/", "/swap"] : ["/", "/swap", "/stake"];
        for (const route of routesToPrerender) {
          const metadata = generatePageMetadata(route);
          const html = template.replace(/<!--meta-title-->/g, metadata.title).replace(/<!--meta-og-title-->/g, metadata.title).replace(/<!--meta-description-->/g, metadata.description).replace(/<!--meta-og-description-->/g, metadata.description).replace(/<!--meta-og-image-->/g, metadata.ogImage).replace(/<!--meta-twt-image-->/g, metadata.ogImage).replace(/<!--meta-keywords-->/g, metadata.keywords.join(", ")).replace(/<!--meta-canonical-->/g, metadata.canonical);
          const filePath = route === "/" ? path.join(config.build.outDir, "index.html") : path.join(config.build.outDir, `${route.slice(1)}.html`);
          fs.writeFileSync(filePath, html);
          console.log(`Generated ${route} at ${filePath}`);
        }
      }
    }
  };
}
function generatePageMetadata(path3) {
  const baseMetadata = {
    "/": {
      title: "Bridge BTC to Ethereum, Arbitrum, Base, Hyperliquid | Garden",
      description: "Bridge BTC across Ethereum, Arbitrum, Base, Berachain, Hyperliquid & more. Swap BTC, wBTC, cbBTC, USDC, and LBTC with fast, trustless settlements via Garden.",
      keywords: [
        "bitcoin hyperliquid bridge",
        "btc to wbtc swap",
        "cross chain bitcoin bridge",
        "trustless btc bridge",
        "btc to cbBTC bridge"
      ],
      ogImage: "/metadata.png",
      canonical: "/"
    },
    "/stake": {
      title: "Stake SEED Token | Earn APY & Join Governance | Garden",
      description: "Stake your SEED tokens with Garden to earn APY, share in protocol revenue, and join governance decisions.",
      keywords: [
        "seed token staking",
        "earn apy on seed",
        "garden finance governance",
        "stake seed token"
      ],
      ogImage: "/stake.png",
      canonical: "/stake"
    }
    // "/quest": {
    //   title: "Garden Finance Quests",
    //   description:
    //     "Get involved in the Garden ecosystem and earn SEED tokens by completing quests.",
    //   keywords: [
    //     "Earn SEED tokens",
    //     "SEED token rewards",
    //     "SEED token airdrop",
    //   ],
    //   ogImage: "/quest.png",
    //   canonical: "/quest",
    // },
  };
  if (path3 === "/swap") {
    return baseMetadata["/"];
  }
  return baseMetadata[path3] || baseMetadata["/"];
}

// vite.config.ts
import process from "process";
var __vite_injected_original_import_meta_url = "file:///Users/rakesh/Documents/Garden%20Prod/garden-kiosk/vite.config.ts";
var getRecentGitCommitHash = () => {
  try {
    if (process.env.SOURCE_COMMIT) {
      return process.env.SOURCE_COMMIT.substring(0, 7);
    }
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.warn("Failed to get Git commit hash, using fallback", error);
    return `build-${Date.now().toString(36)}`;
  }
};
var generateBuildIdFile = () => {
  const __dirname = path2.dirname(new URL(__vite_injected_original_import_meta_url).pathname);
  const buildIdPath = path2.resolve(__dirname, "public/build-id.json");
  fs2.writeFileSync(buildIdPath, JSON.stringify({ buildId }, null, 2));
};
var buildId = getRecentGitCommitHash();
var vite_config_default = defineConfig({
  plugins: [
    react(),
    wasm(),
    metadataPlugin(),
    nodePolyfills({
      globals: {
        process: true,
        Buffer: true,
        global: true
      }
    }),
    topLevelAwait(),
    {
      name: "generate-build-id",
      buildEnd() {
        generateBuildIdFile();
      },
      configureServer(server) {
        generateBuildIdFile();
        server.middlewares.use((req, res, next) => {
          if (req.url === "/build-id.json") {
            const buildIdPath = path2.resolve(
              path2.dirname(new URL(__vite_injected_original_import_meta_url).pathname),
              "public/build-id.json"
            );
            fs2.readFile(buildIdPath, (err, data) => {
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
      }
    },
    viteStaticCopy({
      targets: [
        {
          src: path2.resolve(
            path2.dirname(new URL(__vite_injected_original_import_meta_url).pathname),
            "build-id.json"
          ),
          dest: "public"
        }
      ]
    }),
    sentryVitePlugin({
      org: "garden",
      project: "kiosk",
      url: "https://telemetry.garden.finance/"
    })
  ],
  esbuild: {
    target: "esnext",
    treeShaking: true,
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  build: {
    target: "esnext",
    sourcemap: true,
    minify: "terser",
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2e3,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          libs: [
            "@gardenfi/garden-book",
            "framer-motion",
            "@gardenfi/wallet-connectors"
          ]
        }
      }
    }
  },
  preview: {
    allowedHosts: true
  },
  define: {
    "process.env.BUILD_ID": JSON.stringify(buildId),
    "process.version": JSON.stringify("v18.16.1")
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1tZXRhZGF0YS1wbHVnaW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcmFrZXNoL0RvY3VtZW50cy9HYXJkZW4gUHJvZC9nYXJkZW4ta2lvc2tcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9yYWtlc2gvRG9jdW1lbnRzL0dhcmRlbiBQcm9kL2dhcmRlbi1raW9zay92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvcmFrZXNoL0RvY3VtZW50cy9HYXJkZW4lMjBQcm9kL2dhcmRlbi1raW9zay92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tIFwiQHNlbnRyeS92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHdhc20gZnJvbSBcInZpdGUtcGx1Z2luLXdhc21cIjtcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjtcbmltcG9ydCB0b3BMZXZlbEF3YWl0IGZyb20gXCJ2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXRcIjtcbmltcG9ydCB7IG1ldGFkYXRhUGx1Z2luIH0gZnJvbSBcIi4vdml0ZS1tZXRhZGF0YS1wbHVnaW5cIjtcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJwcm9jZXNzXCI7XG5cbmNvbnN0IGdldFJlY2VudEdpdENvbW1pdEhhc2ggPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVHJ5IHRvIGdldCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlIGZpcnN0IChEb2NrZXIgYnVpbGQpXG4gICAgaWYgKHByb2Nlc3MuZW52LlNPVVJDRV9DT01NSVQpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzLmVudi5TT1VSQ0VfQ09NTUlULnN1YnN0cmluZygwLCA3KTtcbiAgICB9XG4gICAgLy8gRmFsbGJhY2sgdG8gZ2l0IGNvbW1hbmRcbiAgICByZXR1cm4gZXhlY1N5bmMoXCJnaXQgcmV2LXBhcnNlIC0tc2hvcnQgSEVBRFwiKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gZ2V0IEdpdCBjb21taXQgaGFzaCwgdXNpbmcgZmFsbGJhY2tcIiwgZXJyb3IpO1xuICAgIC8vIFVzZSB0aW1lc3RhbXAgYXMgZmFsbGJhY2tcbiAgICByZXR1cm4gYGJ1aWxkLSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YDtcbiAgfVxufTtcblxuY29uc3QgZ2VuZXJhdGVCdWlsZElkRmlsZSA9ICgpID0+IHtcbiAgY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSk7XG4gIGNvbnN0IGJ1aWxkSWRQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJwdWJsaWMvYnVpbGQtaWQuanNvblwiKTtcbiAgZnMud3JpdGVGaWxlU3luYyhidWlsZElkUGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBidWlsZElkIH0sIG51bGwsIDIpKTtcbn07XG5cbmNvbnN0IGJ1aWxkSWQgPSBnZXRSZWNlbnRHaXRDb21taXRIYXNoKCk7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB3YXNtKCksXG4gICAgbWV0YWRhdGFQbHVnaW4oKSxcbiAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICBnbG9iYWw6IHRydWUsXG4gICAgICB9LFxuICAgIH0pLFxuICAgIHRvcExldmVsQXdhaXQoKSxcbiAgICB7XG4gICAgICBuYW1lOiBcImdlbmVyYXRlLWJ1aWxkLWlkXCIsXG4gICAgICBidWlsZEVuZCgpIHtcbiAgICAgICAgZ2VuZXJhdGVCdWlsZElkRmlsZSgpO1xuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgZ2VuZXJhdGVCdWlsZElkRmlsZSgpO1xuICAgICAgICAvLyBIYXZlIHRvIHdyaXRlIGEgY3VzdG9tIG1pZGRsZXdhcmUgdG8gc2VydmUgdGhlIGJ1aWxkIElkIGZpbGUsXG4gICAgICAgIC8vIGJlY2F1c2Ugdml0ZSBkZXYgc2VydmVyIGRvZXNuJ3Qgc2VydmUgZmlsZXMgZnJvbSBwdWJsaWMgZGlyZWN0b3J5IGFzIHNvb24gYXMgdGhleSBhcmUgZ2VuZXJhdGVkLlxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmIChyZXEudXJsID09PSBcIi9idWlsZC1pZC5qc29uXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkSWRQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICBwYXRoLmRpcm5hbWUobmV3IFVSTChpbXBvcnQubWV0YS51cmwpLnBhdGhuYW1lKSxcbiAgICAgICAgICAgICAgXCJwdWJsaWMvYnVpbGQtaWQuanNvblwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZnMucmVhZEZpbGUoYnVpbGRJZFBhdGgsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoXCJCdWlsZCBJRCBub3QgZm91bmRcIik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChkYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgIHRhcmdldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSksXG4gICAgICAgICAgICBcImJ1aWxkLWlkLmpzb25cIlxuICAgICAgICAgICksXG4gICAgICAgICAgZGVzdDogXCJwdWJsaWNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IFwiZ2FyZGVuXCIsXG4gICAgICBwcm9qZWN0OiBcImtpb3NrXCIsXG4gICAgICB1cmw6IFwiaHR0cHM6Ly90ZWxlbWV0cnkuZ2FyZGVuLmZpbmFuY2UvXCIsXG4gICAgfSksXG4gIF0sXG4gIGVzYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgdHJlZVNoYWtpbmc6IHRydWUsXG4gICAgZHJvcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gW1wiY29uc29sZVwiLCBcImRlYnVnZ2VyXCJdIDogW10sXG4gICAgbWluaWZ5SWRlbnRpZmllcnM6IHRydWUsXG4gICAgbWluaWZ5U3ludGF4OiB0cnVlLFxuICAgIG1pbmlmeVdoaXRlc3BhY2U6IHRydWUsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgbGliczogW1xuICAgICAgICAgICAgXCJAZ2FyZGVuZmkvZ2FyZGVuLWJvb2tcIixcbiAgICAgICAgICAgIFwiZnJhbWVyLW1vdGlvblwiLFxuICAgICAgICAgICAgXCJAZ2FyZGVuZmkvd2FsbGV0LWNvbm5lY3RvcnNcIixcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBcInByb2Nlc3MuZW52LkJVSUxEX0lEXCI6IEpTT04uc3RyaW5naWZ5KGJ1aWxkSWQpLFxuICAgIFwicHJvY2Vzcy52ZXJzaW9uXCI6IEpTT04uc3RyaW5naWZ5KFwidjE4LjE2LjFcIiksXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3Jha2VzaC9Eb2N1bWVudHMvR2FyZGVuIFByb2QvZ2FyZGVuLWtpb3NrXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcmFrZXNoL0RvY3VtZW50cy9HYXJkZW4gUHJvZC9nYXJkZW4ta2lvc2svdml0ZS1tZXRhZGF0YS1wbHVnaW4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3Jha2VzaC9Eb2N1bWVudHMvR2FyZGVuJTIwUHJvZC9nYXJkZW4ta2lvc2svdml0ZS1tZXRhZGF0YS1wbHVnaW4udHNcIjtpbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnLCBWaXRlRGV2U2VydmVyIH0gZnJvbSBcInZpdGVcIjtcblxuaW50ZXJmYWNlIE1ldGFkYXRhIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAga2V5d29yZHM6IHN0cmluZ1tdO1xuICBvZ0ltYWdlOiBzdHJpbmc7XG4gIGNhbm9uaWNhbDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YWRhdGFQbHVnaW4oKTogUGx1Z2luIHtcbiAgbGV0IGNvbmZpZzogUmVzb2x2ZWRDb25maWc7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtbWV0YWRhdGEtcGx1Z2luXCIsXG4gICAgZW5mb3JjZTogXCJwb3N0XCIsXG5cbiAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIGNvbmZpZyA9IHJlc29sdmVkQ29uZmlnO1xuICAgIH0sXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKCFyZXEudXJsKSByZXR1cm4gbmV4dCgpO1xuXG4gICAgICAgIC8vIEF2b2lkIHNlcnZpbmcgSFRNTCBmb3IgbW9kdWxlIGFuZCBhc3NldCByZXF1ZXN0c1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIXJlcS51cmwuZW5kc1dpdGgoXCIuaHRtbFwiKSAmJlxuICAgICAgICAgICFyZXEuaGVhZGVycy5hY2NlcHQ/LmluY2x1ZGVzKFwidGV4dC9odG1sXCIpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3V0ZSA9IHJlcS51cmwgPT09IFwiL1wiID8gXCIvXCIgOiByZXEudXJsLnNwbGl0KFwiP1wiKVswXSB8fCBcIi9cIjtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBnZW5lcmF0ZVBhZ2VNZXRhZGF0YShyb3V0ZSk7XG5cbiAgICAgICAgLy8gVXNlIFZpdGUncyBuYXRpdmUgSFRNTCBoYW5kbGVyIGZpcnN0XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbCA9IGF3YWl0IHNlcnZlci50cmFuc2Zvcm1JbmRleEh0bWwoXG4gICAgICAgICAgcmVxLnVybCxcbiAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGNvbmZpZy5yb290LCBcImluZGV4Lmh0bWxcIiksIFwidXRmLThcIilcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJbmplY3QgbWV0YWRhdGEgaW50byB0aGUgSFRNTFxuICAgICAgICBjb25zdCBodG1sID0gb3JpZ2luYWxIdG1sXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLXRpdGxlLS0+L2csIG1ldGFkYXRhLnRpdGxlKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1vZy10aXRsZS0tPi9nLCBtZXRhZGF0YS50aXRsZSlcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLW9nLWRlc2NyaXB0aW9uLS0+L2csIG1ldGFkYXRhLmRlc2NyaXB0aW9uKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1vZy1pbWFnZS0tPi9nLCBtZXRhZGF0YS5vZ0ltYWdlKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS10d3QtaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSlcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEta2V5d29yZHMtLT4vZywgbWV0YWRhdGEua2V5d29yZHMuam9pbihcIiwgXCIpKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1jYW5vbmljYWwtLT4vZywgbWV0YWRhdGEuY2Fub25pY2FsKTtcblxuICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC9odG1sXCIpO1xuICAgICAgICByZXMuZW5kKGh0bWwpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gT25seSBydW4gaW4gYnVpbGQgbW9kZVxuICAgICAgaWYgKGNvbmZpZy5jb21tYW5kID09PSBcImJ1aWxkXCIpIHtcbiAgICAgICAgLy8gUmVhZCB0aGUgdGVtcGxhdGVcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgcGF0aC5qb2luKGNvbmZpZy5idWlsZC5vdXREaXIsIFwiaW5kZXguaHRtbFwiKSxcbiAgICAgICAgICBcInV0Zi04XCJcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXNUZXN0bmV0ID0gY29uZmlnLmVudi5WSVRFX05FVFdPUksgPT09IFwidGVzdG5ldFwiO1xuICAgICAgICAvLyBPbmx5IHByZXJlbmRlciAvc3Rha2UgaWYgbm90IHRlc3RuZXRcbiAgICAgICAgY29uc3Qgcm91dGVzVG9QcmVyZW5kZXIgPSBpc1Rlc3RuZXRcbiAgICAgICAgICA/IFtcIi9cIiwgXCIvc3dhcFwiXVxuICAgICAgICAgIDogW1wiL1wiLCBcIi9zd2FwXCIsIFwiL3N0YWtlXCJdO1xuICAgICAgICBmb3IgKGNvbnN0IHJvdXRlIG9mIHJvdXRlc1RvUHJlcmVuZGVyKSB7XG4gICAgICAgICAgLy8gR2VuZXJhdGUgbWV0YWRhdGEgZm9yIHRoaXMgcm91dGVcbiAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGdlbmVyYXRlUGFnZU1ldGFkYXRhKHJvdXRlKTtcblxuICAgICAgICAgIC8vIEluamVjdCBtZXRhZGF0YSBpbnRvIHRlbXBsYXRlXG4gICAgICAgICAgY29uc3QgaHRtbCA9IHRlbXBsYXRlXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS10d3QtaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1rZXl3b3Jkcy0tPi9nLCBtZXRhZGF0YS5rZXl3b3Jkcy5qb2luKFwiLCBcIikpXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtY2Fub25pY2FsLS0+L2csIG1ldGFkYXRhLmNhbm9uaWNhbCk7XG5cbiAgICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgY29ycmVjdCBmaWxlIHBhdGhcbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9XG4gICAgICAgICAgICByb3V0ZSA9PT0gXCIvXCJcbiAgICAgICAgICAgICAgPyBwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgXCJpbmRleC5odG1sXCIpXG4gICAgICAgICAgICAgIDogcGF0aC5qb2luKGNvbmZpZy5idWlsZC5vdXREaXIsIGAke3JvdXRlLnNsaWNlKDEpfS5odG1sYCk7XG5cbiAgICAgICAgICAvLyBXcml0ZSB0aGUgZmlsZVxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWwpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBHZW5lcmF0ZWQgJHtyb3V0ZX0gYXQgJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUGFnZU1ldGFkYXRhKHBhdGg6IHN0cmluZyk6IE1ldGFkYXRhIHtcbiAgY29uc3QgYmFzZU1ldGFkYXRhOiBSZWNvcmQ8c3RyaW5nLCBNZXRhZGF0YT4gPSB7XG4gICAgXCIvXCI6IHtcbiAgICAgIHRpdGxlOiBcIkJyaWRnZSBCVEMgdG8gRXRoZXJldW0sIEFyYml0cnVtLCBCYXNlLCBIeXBlcmxpcXVpZCB8IEdhcmRlblwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQnJpZGdlIEJUQyBhY3Jvc3MgRXRoZXJldW0sIEFyYml0cnVtLCBCYXNlLCBCZXJhY2hhaW4sIEh5cGVybGlxdWlkICYgbW9yZS4gU3dhcCBCVEMsIHdCVEMsIGNiQlRDLCBVU0RDLCBhbmQgTEJUQyB3aXRoIGZhc3QsIHRydXN0bGVzcyBzZXR0bGVtZW50cyB2aWEgR2FyZGVuLlwiLFxuICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgXCJiaXRjb2luIGh5cGVybGlxdWlkIGJyaWRnZVwiLFxuICAgICAgICBcImJ0YyB0byB3YnRjIHN3YXBcIixcbiAgICAgICAgXCJjcm9zcyBjaGFpbiBiaXRjb2luIGJyaWRnZVwiLFxuICAgICAgICBcInRydXN0bGVzcyBidGMgYnJpZGdlXCIsXG4gICAgICAgIFwiYnRjIHRvIGNiQlRDIGJyaWRnZVwiLFxuICAgICAgXSxcbiAgICAgIG9nSW1hZ2U6IFwiL21ldGFkYXRhLnBuZ1wiLFxuICAgICAgY2Fub25pY2FsOiBcIi9cIixcbiAgICB9LFxuICAgIFwiL3N0YWtlXCI6IHtcbiAgICAgIHRpdGxlOiBcIlN0YWtlIFNFRUQgVG9rZW4gfCBFYXJuIEFQWSAmIEpvaW4gR292ZXJuYW5jZSB8IEdhcmRlblwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiU3Rha2UgeW91ciBTRUVEIHRva2VucyB3aXRoIEdhcmRlbiB0byBlYXJuIEFQWSwgc2hhcmUgaW4gcHJvdG9jb2wgcmV2ZW51ZSwgYW5kIGpvaW4gZ292ZXJuYW5jZSBkZWNpc2lvbnMuXCIsXG4gICAgICBrZXl3b3JkczogW1xuICAgICAgICBcInNlZWQgdG9rZW4gc3Rha2luZ1wiLFxuICAgICAgICBcImVhcm4gYXB5IG9uIHNlZWRcIixcbiAgICAgICAgXCJnYXJkZW4gZmluYW5jZSBnb3Zlcm5hbmNlXCIsXG4gICAgICAgIFwic3Rha2Ugc2VlZCB0b2tlblwiLFxuICAgICAgXSxcbiAgICAgIG9nSW1hZ2U6IFwiL3N0YWtlLnBuZ1wiLFxuICAgICAgY2Fub25pY2FsOiBcIi9zdGFrZVwiLFxuICAgIH0sXG4gICAgLy8gXCIvcXVlc3RcIjoge1xuICAgIC8vICAgdGl0bGU6IFwiR2FyZGVuIEZpbmFuY2UgUXVlc3RzXCIsXG4gICAgLy8gICBkZXNjcmlwdGlvbjpcbiAgICAvLyAgICAgXCJHZXQgaW52b2x2ZWQgaW4gdGhlIEdhcmRlbiBlY29zeXN0ZW0gYW5kIGVhcm4gU0VFRCB0b2tlbnMgYnkgY29tcGxldGluZyBxdWVzdHMuXCIsXG4gICAgLy8gICBrZXl3b3JkczogW1xuICAgIC8vICAgICBcIkVhcm4gU0VFRCB0b2tlbnNcIixcbiAgICAvLyAgICAgXCJTRUVEIHRva2VuIHJld2FyZHNcIixcbiAgICAvLyAgICAgXCJTRUVEIHRva2VuIGFpcmRyb3BcIixcbiAgICAvLyAgIF0sXG4gICAgLy8gICBvZ0ltYWdlOiBcIi9xdWVzdC5wbmdcIixcbiAgICAvLyAgIGNhbm9uaWNhbDogXCIvcXVlc3RcIixcbiAgICAvLyB9LFxuICB9O1xuXG4gIGlmIChwYXRoID09PSBcIi9zd2FwXCIpIHtcbiAgICByZXR1cm4gYmFzZU1ldGFkYXRhW1wiL1wiXTtcbiAgfVxuXG4gIHJldHVybiBiYXNlTWV0YWRhdGFbcGF0aF0gfHwgYmFzZU1ldGFkYXRhW1wiL1wiXTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1UsU0FBUyx3QkFBd0I7QUFDclcsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsc0JBQXNCO0FBQy9CLE9BQU9BLFdBQVU7QUFDakIsT0FBT0MsU0FBUTtBQUNmLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLG1CQUFtQjs7O0FDVDRULE9BQU8sUUFBUTtBQUNyVyxPQUFPLFVBQVU7QUFXVixTQUFTLGlCQUF5QjtBQUN2QyxNQUFJO0FBRUosU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBRVQsZUFBZSxnQkFBZ0M7QUFDN0MsZUFBUztBQUFBLElBQ1g7QUFBQSxJQUNBLGdCQUFnQixRQUF1QjtBQUNyQyxhQUFPLFlBQVksSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTO0FBQy9DLFlBQUksQ0FBQyxJQUFJLElBQUssUUFBTyxLQUFLO0FBRzFCLFlBQ0UsQ0FBQyxJQUFJLElBQUksU0FBUyxPQUFPLEtBQ3pCLENBQUMsSUFBSSxRQUFRLFFBQVEsU0FBUyxXQUFXLEdBQ3pDO0FBQ0EsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFFQSxjQUFNLFFBQVEsSUFBSSxRQUFRLE1BQU0sTUFBTSxJQUFJLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLO0FBQy9ELGNBQU0sV0FBVyxxQkFBcUIsS0FBSztBQUczQyxjQUFNLGVBQWUsTUFBTSxPQUFPO0FBQUEsVUFDaEMsSUFBSTtBQUFBLFVBQ0osR0FBRyxhQUFhLEtBQUss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b0JBQW9CO0FBQUEsY0FDOUIsT0FBTztBQUNMLG9CQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxvQkFBSSxJQUFJLElBQUk7QUFBQSxjQUNkO0FBQUEsWUFDRixDQUFDO0FBQUEsVUFDSCxPQUFPO0FBQ0wsaUJBQUs7QUFBQSxVQUNQO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLRCxNQUFLO0FBQUEsWUFDUkEsTUFBSyxRQUFRLElBQUksSUFBSSx3Q0FBZSxFQUFFLFFBQVE7QUFBQSxZQUM5QztBQUFBLFVBQ0Y7QUFBQSxVQUNBLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsaUJBQWlCO0FBQUEsTUFDZixLQUFLO0FBQUEsTUFDTCxTQUFTO0FBQUEsTUFDVCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsTUFBTSxRQUFRLElBQUksYUFBYSxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLElBQ3pFLG1CQUFtQjtBQUFBLElBQ25CLGNBQWM7QUFBQSxJQUNkLGtCQUFrQjtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixzQkFBc0I7QUFBQSxJQUN0Qix1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ2pELE1BQU07QUFBQSxZQUNKO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTix3QkFBd0IsS0FBSyxVQUFVLE9BQU87QUFBQSxJQUM5QyxtQkFBbUIsS0FBSyxVQUFVLFVBQVU7QUFBQSxFQUM5QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiZnMiLCAicGF0aCIsICJwYXRoIiwgImZzIl0KfQo=
