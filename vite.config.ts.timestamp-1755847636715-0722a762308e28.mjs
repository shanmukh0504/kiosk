// vite.config.ts
import { sentryVitePlugin } from "file:///Users/adithya/catalog/garden-kiosk/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { defineConfig } from "file:///Users/adithya/catalog/garden-kiosk/node_modules/vite/dist/node/index.js";
import react from "file:///Users/adithya/catalog/garden-kiosk/node_modules/@vitejs/plugin-react/dist/index.js";
import { execSync } from "child_process";
import { viteStaticCopy } from "file:///Users/adithya/catalog/garden-kiosk/node_modules/vite-plugin-static-copy/dist/index.js";
import path2 from "path";
import fs2 from "fs";
import wasm from "file:///Users/adithya/catalog/garden-kiosk/node_modules/vite-plugin-wasm/exports/import.mjs";
import { nodePolyfills } from "file:///Users/adithya/catalog/garden-kiosk/node_modules/vite-plugin-node-polyfills/dist/index.js";
import topLevelAwait from "file:///Users/adithya/catalog/garden-kiosk/node_modules/vite-plugin-top-level-await/exports/import.mjs";

// vite-metadata-plugin.ts
import fs from "fs";
import path from "path";

// src/constants/app.ts
var APP_URL = "https://gardenapp.staging.jheb.com";
var APP_NAME = "Garden Finance";
var APP_DESCRIPTION = "Bridge with Garden Finance";
var APP_TAGLINE = "Move Bitcoin. without. trust. Garden is the fastest and most cost-efficient way to move native Bitcoin between chains, without giving up custody.";
var FRAME_METADATA = {
  version: "vNext",
  imageUrl: `${APP_URL}/metadata.png`,
  button: {
    title: "Launch Garden Finance",
    action: {
      type: "launch_frame",
      name: APP_NAME,
      url: APP_URL,
      splashImageUrl: `${APP_URL}/metadata.png`,
      splashBackgroundColor: "#FFFFFF"
    }
  }
};
var MINI_APP_METADATA = {
  name: APP_NAME,
  version: "1",
  iconUrl: `${APP_URL}/favicon.svg`,
  homeUrl: APP_URL,
  imageUrl: `${APP_URL}/metadata.png`,
  buttonTitle: "Bridge with Garden Finance",
  splashImageUrl: `${APP_URL}/metadata.png`,
  splashBackgroundColor: "#FFFFFF",
  webhookUrl: `${APP_URL}/api/webhook`,
  subtitle: APP_DESCRIPTION,
  primaryCategory: "finance",
  description: APP_TAGLINE,
  screenshotUrls: [`${APP_URL}/metadata.png`],
  heroImageUrl: `${APP_URL}/metadata.png`,
  tags: ["bitcoin", "finance", "defi", "bridge"],
  tagline: APP_DESCRIPTION,
  ogTitle: APP_NAME,
  ogDescription: APP_DESCRIPTION,
  ogImageUrl: `${APP_URL}/metadata.png`,
  castShareUrl: `${APP_URL}/metadata.png`
};

// vite-metadata-plugin.ts
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
function frameMetadataPlugin() {
  return {
    name: "frame-metadata",
    transformIndexHtml(html) {
      const frameMetaTag = `<meta name="fc:frame" content='${JSON.stringify(FRAME_METADATA)}' />`;
      const miniAppMetaTag = `<meta name="fc:mini-app" content='${JSON.stringify(MINI_APP_METADATA)}' />`;
      let updatedHtml = html;
      if (html.includes('name="fc:frame"')) {
        updatedHtml = html.replace(/<meta name="fc:frame"[^>]*>/, frameMetaTag);
      } else {
        const insertAfter = "</head>";
        updatedHtml = html.replace(
          insertAfter,
          `    ${frameMetaTag}
  ${insertAfter}`
        );
      }
      if (html.includes('name="fc:mini-app"')) {
        const miniAppRegex = /<meta\s+name="fc:mini-app"\s+content='[^']*'[^>]*>/;
        if (miniAppRegex.test(updatedHtml)) {
          updatedHtml = updatedHtml.replace(miniAppRegex, miniAppMetaTag);
        }
      }
      return updatedHtml;
    }
  };
}

// vite.config.ts
import process from "process";
var __vite_injected_original_import_meta_url = "file:///Users/adithya/catalog/garden-kiosk/vite.config.ts";
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
    frameMetadataPlugin(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1tZXRhZGF0YS1wbHVnaW4udHMiLCAic3JjL2NvbnN0YW50cy9hcHAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRpdGh5YS9jYXRhbG9nL2dhcmRlbi1raW9za1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkaXRoeWEvY2F0YWxvZy9nYXJkZW4ta2lvc2svdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkaXRoeWEvY2F0YWxvZy9nYXJkZW4ta2lvc2svdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1zdGF0aWMtY29weVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB3YXNtIGZyb20gXCJ2aXRlLXBsdWdpbi13YXNtXCI7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSBcInZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzXCI7XG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tIFwidml0ZS1wbHVnaW4tdG9wLWxldmVsLWF3YWl0XCI7XG5pbXBvcnQgeyBmcmFtZU1ldGFkYXRhUGx1Z2luLCBtZXRhZGF0YVBsdWdpbiB9IGZyb20gXCIuL3ZpdGUtbWV0YWRhdGEtcGx1Z2luXCI7XG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwicHJvY2Vzc1wiO1xuXG5jb25zdCBnZXRSZWNlbnRHaXRDb21taXRIYXNoID0gKCkgPT4ge1xuICB0cnkge1xuICAgIC8vIFRyeSB0byBnZXQgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZSBmaXJzdCAoRG9ja2VyIGJ1aWxkKVxuICAgIGlmIChwcm9jZXNzLmVudi5TT1VSQ0VfQ09NTUlUKSB7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuU09VUkNFX0NPTU1JVC5zdWJzdHJpbmcoMCwgNyk7XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrIHRvIGdpdCBjb21tYW5kXG4gICAgcmV0dXJuIGV4ZWNTeW5jKFwiZ2l0IHJldi1wYXJzZSAtLXNob3J0IEhFQURcIikudG9TdHJpbmcoKS50cmltKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGdldCBHaXQgY29tbWl0IGhhc2gsIHVzaW5nIGZhbGxiYWNrXCIsIGVycm9yKTtcbiAgICAvLyBVc2UgdGltZXN0YW1wIGFzIGZhbGxiYWNrXG4gICAgcmV0dXJuIGBidWlsZC0ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWA7XG4gIH1cbn07XG5cbmNvbnN0IGdlbmVyYXRlQnVpbGRJZEZpbGUgPSAoKSA9PiB7XG4gIGNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShuZXcgVVJMKGltcG9ydC5tZXRhLnVybCkucGF0aG5hbWUpO1xuICBjb25zdCBidWlsZElkUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwicHVibGljL2J1aWxkLWlkLmpzb25cIik7XG4gIGZzLndyaXRlRmlsZVN5bmMoYnVpbGRJZFBhdGgsIEpTT04uc3RyaW5naWZ5KHsgYnVpbGRJZCB9LCBudWxsLCAyKSk7XG59O1xuXG5jb25zdCBidWlsZElkID0gZ2V0UmVjZW50R2l0Q29tbWl0SGFzaCgpO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgd2FzbSgpLFxuICAgIG1ldGFkYXRhUGx1Z2luKCksXG4gICAgZnJhbWVNZXRhZGF0YVBsdWdpbigpLFxuICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgZ2xvYmFsczoge1xuICAgICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgICBCdWZmZXI6IHRydWUsXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgdG9wTGV2ZWxBd2FpdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6IFwiZ2VuZXJhdGUtYnVpbGQtaWRcIixcbiAgICAgIGJ1aWxkRW5kKCkge1xuICAgICAgICBnZW5lcmF0ZUJ1aWxkSWRGaWxlKCk7XG4gICAgICB9LFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjoge1xuICAgICAgICBtaWRkbGV3YXJlczoge1xuICAgICAgICAgIHVzZTogKGFyZzA6IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4gdm9pZCkgPT4gdm9pZDtcbiAgICAgICAgfTtcbiAgICAgIH0pIHtcbiAgICAgICAgZ2VuZXJhdGVCdWlsZElkRmlsZSgpO1xuICAgICAgICAvLyBIYXZlIHRvIHdyaXRlIGEgY3VzdG9tIG1pZGRsZXdhcmUgdG8gc2VydmUgdGhlIGJ1aWxkIElkIGZpbGUsXG4gICAgICAgIC8vIGJlY2F1c2Ugdml0ZSBkZXYgc2VydmVyIGRvZXNuJ3Qgc2VydmUgZmlsZXMgZnJvbSBwdWJsaWMgZGlyZWN0b3J5IGFzIHNvb24gYXMgdGhleSBhcmUgZ2VuZXJhdGVkLlxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmIChyZXEudXJsID09PSBcIi9idWlsZC1pZC5qc29uXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkSWRQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICBwYXRoLmRpcm5hbWUobmV3IFVSTChpbXBvcnQubWV0YS51cmwpLnBhdGhuYW1lKSxcbiAgICAgICAgICAgICAgXCJwdWJsaWMvYnVpbGQtaWQuanNvblwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZnMucmVhZEZpbGUoYnVpbGRJZFBhdGgsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoXCJCdWlsZCBJRCBub3QgZm91bmRcIik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChkYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgIHRhcmdldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSksXG4gICAgICAgICAgICBcImJ1aWxkLWlkLmpzb25cIlxuICAgICAgICAgICksXG4gICAgICAgICAgZGVzdDogXCJwdWJsaWNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IFwiZ2FyZGVuXCIsXG4gICAgICBwcm9qZWN0OiBcImtpb3NrXCIsXG4gICAgICB1cmw6IFwiaHR0cHM6Ly90ZWxlbWV0cnkuZ2FyZGVuLmZpbmFuY2UvXCIsXG4gICAgfSksXG4gIF0sXG4gIGVzYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgdHJlZVNoYWtpbmc6IHRydWUsXG4gICAgZHJvcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gW1wiY29uc29sZVwiLCBcImRlYnVnZ2VyXCJdIDogW10sXG4gICAgbWluaWZ5SWRlbnRpZmllcnM6IHRydWUsXG4gICAgbWluaWZ5U3ludGF4OiB0cnVlLFxuICAgIG1pbmlmeVdoaXRlc3BhY2U6IHRydWUsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgbGliczogW1xuICAgICAgICAgICAgXCJAZ2FyZGVuZmkvZ2FyZGVuLWJvb2tcIixcbiAgICAgICAgICAgIFwiZnJhbWVyLW1vdGlvblwiLFxuICAgICAgICAgICAgXCJAZ2FyZGVuZmkvd2FsbGV0LWNvbm5lY3RvcnNcIixcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBcInByb2Nlc3MuZW52LkJVSUxEX0lEXCI6IEpTT04uc3RyaW5naWZ5KGJ1aWxkSWQpLFxuICAgIFwicHJvY2Vzcy52ZXJzaW9uXCI6IEpTT04uc3RyaW5naWZ5KFwidjE4LjE2LjFcIiksXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FkaXRoeWEvY2F0YWxvZy9nYXJkZW4ta2lvc2tcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZGl0aHlhL2NhdGFsb2cvZ2FyZGVuLWtpb3NrL3ZpdGUtbWV0YWRhdGEtcGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hZGl0aHlhL2NhdGFsb2cvZ2FyZGVuLWtpb3NrL3ZpdGUtbWV0YWRhdGEtcGx1Z2luLnRzXCI7aW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZywgVml0ZURldlNlcnZlciB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBGUkFNRV9NRVRBREFUQSwgTUlOSV9BUFBfTUVUQURBVEEgfSBmcm9tIFwiLi9zcmMvY29uc3RhbnRzL2FwcFwiO1xuXG5pbnRlcmZhY2UgTWV0YWRhdGEge1xuICB0aXRsZTogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBrZXl3b3Jkczogc3RyaW5nW107XG4gIG9nSW1hZ2U6IHN0cmluZztcbiAgY2Fub25pY2FsOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXRhZGF0YVBsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgY29uZmlnOiBSZXNvbHZlZENvbmZpZztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IFwidml0ZS1tZXRhZGF0YS1wbHVnaW5cIixcbiAgICBlbmZvcmNlOiBcInBvc3RcIixcblxuICAgIGNvbmZpZ1Jlc29sdmVkKHJlc29sdmVkQ29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgY29uZmlnID0gcmVzb2x2ZWRDb25maWc7XG4gICAgfSxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAoIXJlcS51cmwpIHJldHVybiBuZXh0KCk7XG5cbiAgICAgICAgLy8gQXZvaWQgc2VydmluZyBIVE1MIGZvciBtb2R1bGUgYW5kIGFzc2V0IHJlcXVlc3RzXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhcmVxLnVybC5lbmRzV2l0aChcIi5odG1sXCIpICYmXG4gICAgICAgICAgIXJlcS5oZWFkZXJzLmFjY2VwdD8uaW5jbHVkZXMoXCJ0ZXh0L2h0bWxcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvdXRlID0gcmVxLnVybCA9PT0gXCIvXCIgPyBcIi9cIiA6IHJlcS51cmwuc3BsaXQoXCI/XCIpWzBdIHx8IFwiL1wiO1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGdlbmVyYXRlUGFnZU1ldGFkYXRhKHJvdXRlKTtcblxuICAgICAgICAvLyBVc2UgVml0ZSdzIG5hdGl2ZSBIVE1MIGhhbmRsZXIgZmlyc3RcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sID0gYXdhaXQgc2VydmVyLnRyYW5zZm9ybUluZGV4SHRtbChcbiAgICAgICAgICByZXEudXJsLFxuICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oY29uZmlnLnJvb3QsIFwiaW5kZXguaHRtbFwiKSwgXCJ1dGYtOFwiKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEluamVjdCBtZXRhZGF0YSBpbnRvIHRoZSBIVE1MXG4gICAgICAgIGNvbnN0IGh0bWwgPSBvcmlnaW5hbEh0bWxcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLW9nLXRpdGxlLS0+L2csIG1ldGFkYXRhLnRpdGxlKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1kZXNjcmlwdGlvbi0tPi9nLCBtZXRhZGF0YS5kZXNjcmlwdGlvbilcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLW9nLWltYWdlLS0+L2csIG1ldGFkYXRhLm9nSW1hZ2UpXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLXR3dC1pbWFnZS0tPi9nLCBtZXRhZGF0YS5vZ0ltYWdlKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1rZXl3b3Jkcy0tPi9nLCBtZXRhZGF0YS5rZXl3b3Jkcy5qb2luKFwiLCBcIikpXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLWNhbm9uaWNhbC0tPi9nLCBtZXRhZGF0YS5jYW5vbmljYWwpO1xuXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L2h0bWxcIik7XG4gICAgICAgIHJlcy5lbmQoaHRtbCk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBPbmx5IHJ1biBpbiBidWlsZCBtb2RlXG4gICAgICBpZiAoY29uZmlnLmNvbW1hbmQgPT09IFwiYnVpbGRcIikge1xuICAgICAgICAvLyBSZWFkIHRoZSB0ZW1wbGF0ZVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICBwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgICAgIFwidXRmLThcIlxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpc1Rlc3RuZXQgPSBjb25maWcuZW52LlZJVEVfTkVUV09SSyA9PT0gXCJ0ZXN0bmV0XCI7XG4gICAgICAgIC8vIE9ubHkgcHJlcmVuZGVyIC9zdGFrZSBpZiBub3QgdGVzdG5ldFxuICAgICAgICBjb25zdCByb3V0ZXNUb1ByZXJlbmRlciA9IGlzVGVzdG5ldFxuICAgICAgICAgID8gW1wiL1wiLCBcIi9zd2FwXCJdXG4gICAgICAgICAgOiBbXCIvXCIsIFwiL3N3YXBcIiwgXCIvc3Rha2VcIl07XG4gICAgICAgIGZvciAoY29uc3Qgcm91dGUgb2Ygcm91dGVzVG9QcmVyZW5kZXIpIHtcbiAgICAgICAgICAvLyBHZW5lcmF0ZSBtZXRhZGF0YSBmb3IgdGhpcyByb3V0ZVxuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gZ2VuZXJhdGVQYWdlTWV0YWRhdGEocm91dGUpO1xuXG4gICAgICAgICAgLy8gSW5qZWN0IG1ldGFkYXRhIGludG8gdGVtcGxhdGVcbiAgICAgICAgICBjb25zdCBodG1sID0gdGVtcGxhdGVcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS10aXRsZS0tPi9nLCBtZXRhZGF0YS50aXRsZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1vZy10aXRsZS0tPi9nLCBtZXRhZGF0YS50aXRsZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1kZXNjcmlwdGlvbi0tPi9nLCBtZXRhZGF0YS5kZXNjcmlwdGlvbilcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1vZy1kZXNjcmlwdGlvbi0tPi9nLCBtZXRhZGF0YS5kZXNjcmlwdGlvbilcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1vZy1pbWFnZS0tPi9nLCBtZXRhZGF0YS5vZ0ltYWdlKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLXR3dC1pbWFnZS0tPi9nLCBtZXRhZGF0YS5vZ0ltYWdlKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLWtleXdvcmRzLS0+L2csIG1ldGFkYXRhLmtleXdvcmRzLmpvaW4oXCIsIFwiKSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1jYW5vbmljYWwtLT4vZywgbWV0YWRhdGEuY2Fub25pY2FsKTtcblxuICAgICAgICAgIC8vIEdlbmVyYXRlIHRoZSBjb3JyZWN0IGZpbGUgcGF0aFxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID1cbiAgICAgICAgICAgIHJvdXRlID09PSBcIi9cIlxuICAgICAgICAgICAgICA/IHBhdGguam9pbihjb25maWcuYnVpbGQub3V0RGlyLCBcImluZGV4Lmh0bWxcIilcbiAgICAgICAgICAgICAgOiBwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgYCR7cm91dGUuc2xpY2UoMSl9Lmh0bWxgKTtcblxuICAgICAgICAgIC8vIFdyaXRlIHRoZSBmaWxlXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgaHRtbCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYEdlbmVyYXRlZCAke3JvdXRlfSBhdCAke2ZpbGVQYXRofWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVQYWdlTWV0YWRhdGEocGF0aDogc3RyaW5nKTogTWV0YWRhdGEge1xuICBjb25zdCBiYXNlTWV0YWRhdGE6IFJlY29yZDxzdHJpbmcsIE1ldGFkYXRhPiA9IHtcbiAgICBcIi9cIjoge1xuICAgICAgdGl0bGU6IFwiQnJpZGdlIEJUQyB0byBFdGhlcmV1bSwgQXJiaXRydW0sIEJhc2UsIEh5cGVybGlxdWlkIHwgR2FyZGVuXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJCcmlkZ2UgQlRDIGFjcm9zcyBFdGhlcmV1bSwgQXJiaXRydW0sIEJhc2UsIEJlcmFjaGFpbiwgSHlwZXJsaXF1aWQgJiBtb3JlLiBTd2FwIEJUQywgd0JUQywgY2JCVEMsIFVTREMsIGFuZCBMQlRDIHdpdGggZmFzdCwgdHJ1c3RsZXNzIHNldHRsZW1lbnRzIHZpYSBHYXJkZW4uXCIsXG4gICAgICBrZXl3b3JkczogW1xuICAgICAgICBcImJpdGNvaW4gaHlwZXJsaXF1aWQgYnJpZGdlXCIsXG4gICAgICAgIFwiYnRjIHRvIHdidGMgc3dhcFwiLFxuICAgICAgICBcImNyb3NzIGNoYWluIGJpdGNvaW4gYnJpZGdlXCIsXG4gICAgICAgIFwidHJ1c3RsZXNzIGJ0YyBicmlkZ2VcIixcbiAgICAgICAgXCJidGMgdG8gY2JCVEMgYnJpZGdlXCIsXG4gICAgICBdLFxuICAgICAgb2dJbWFnZTogXCIvbWV0YWRhdGEucG5nXCIsXG4gICAgICBjYW5vbmljYWw6IFwiL1wiLFxuICAgIH0sXG4gICAgXCIvc3Rha2VcIjoge1xuICAgICAgdGl0bGU6IFwiU3Rha2UgU0VFRCBUb2tlbiB8IEVhcm4gQVBZICYgSm9pbiBHb3Zlcm5hbmNlIHwgR2FyZGVuXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJTdGFrZSB5b3VyIFNFRUQgdG9rZW5zIHdpdGggR2FyZGVuIHRvIGVhcm4gQVBZLCBzaGFyZSBpbiBwcm90b2NvbCByZXZlbnVlLCBhbmQgam9pbiBnb3Zlcm5hbmNlIGRlY2lzaW9ucy5cIixcbiAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgIFwic2VlZCB0b2tlbiBzdGFraW5nXCIsXG4gICAgICAgIFwiZWFybiBhcHkgb24gc2VlZFwiLFxuICAgICAgICBcImdhcmRlbiBmaW5hbmNlIGdvdmVybmFuY2VcIixcbiAgICAgICAgXCJzdGFrZSBzZWVkIHRva2VuXCIsXG4gICAgICBdLFxuICAgICAgb2dJbWFnZTogXCIvc3Rha2UucG5nXCIsXG4gICAgICBjYW5vbmljYWw6IFwiL3N0YWtlXCIsXG4gICAgfSxcbiAgICAvLyBcIi9xdWVzdFwiOiB7XG4gICAgLy8gICB0aXRsZTogXCJHYXJkZW4gRmluYW5jZSBRdWVzdHNcIixcbiAgICAvLyAgIGRlc2NyaXB0aW9uOlxuICAgIC8vICAgICBcIkdldCBpbnZvbHZlZCBpbiB0aGUgR2FyZGVuIGVjb3N5c3RlbSBhbmQgZWFybiBTRUVEIHRva2VucyBieSBjb21wbGV0aW5nIHF1ZXN0cy5cIixcbiAgICAvLyAgIGtleXdvcmRzOiBbXG4gICAgLy8gICAgIFwiRWFybiBTRUVEIHRva2Vuc1wiLFxuICAgIC8vICAgICBcIlNFRUQgdG9rZW4gcmV3YXJkc1wiLFxuICAgIC8vICAgICBcIlNFRUQgdG9rZW4gYWlyZHJvcFwiLFxuICAgIC8vICAgXSxcbiAgICAvLyAgIG9nSW1hZ2U6IFwiL3F1ZXN0LnBuZ1wiLFxuICAgIC8vICAgY2Fub25pY2FsOiBcIi9xdWVzdFwiLFxuICAgIC8vIH0sXG4gIH07XG5cbiAgaWYgKHBhdGggPT09IFwiL3N3YXBcIikge1xuICAgIHJldHVybiBiYXNlTWV0YWRhdGFbXCIvXCJdO1xuICB9XG5cbiAgcmV0dXJuIGJhc2VNZXRhZGF0YVtwYXRoXSB8fCBiYXNlTWV0YWRhdGFbXCIvXCJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJhbWVNZXRhZGF0YVBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiZnJhbWUtbWV0YWRhdGFcIixcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuICAgICAgLy8gSW5qZWN0IGZjOmZyYW1lIG1ldGFkYXRhXG4gICAgICBjb25zdCBmcmFtZU1ldGFUYWcgPSBgPG1ldGEgbmFtZT1cImZjOmZyYW1lXCIgY29udGVudD0nJHtKU09OLnN0cmluZ2lmeShGUkFNRV9NRVRBREFUQSl9JyAvPmA7XG5cbiAgICAgIC8vIEluamVjdCB1cGRhdGVkIG1pbmktYXBwIG1ldGFkYXRhXG4gICAgICBjb25zdCBtaW5pQXBwTWV0YVRhZyA9IGA8bWV0YSBuYW1lPVwiZmM6bWluaS1hcHBcIiBjb250ZW50PScke0pTT04uc3RyaW5naWZ5KE1JTklfQVBQX01FVEFEQVRBKX0nIC8+YDtcblxuICAgICAgLy8gUmVwbGFjZSBleGlzdGluZyBmYzpmcmFtZSBtZXRhIHRhZyBpZiBpdCBleGlzdHMsIG90aGVyd2lzZSBhZGQgaXRcbiAgICAgIGxldCB1cGRhdGVkSHRtbCA9IGh0bWw7XG5cbiAgICAgIC8vIENoZWNrIGlmIGZjOmZyYW1lIG1ldGEgdGFnIGFscmVhZHkgZXhpc3RzXG4gICAgICBpZiAoaHRtbC5pbmNsdWRlcygnbmFtZT1cImZjOmZyYW1lXCInKSkge1xuICAgICAgICB1cGRhdGVkSHRtbCA9IGh0bWwucmVwbGFjZSgvPG1ldGEgbmFtZT1cImZjOmZyYW1lXCJbXj5dKj4vLCBmcmFtZU1ldGFUYWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQWRkIGFmdGVyIHRoZSBleGlzdGluZyBmYzptaW5pLWFwcCB0YWdzXG4gICAgICAgIGNvbnN0IGluc2VydEFmdGVyID0gXCI8L2hlYWQ+XCI7XG4gICAgICAgIHVwZGF0ZWRIdG1sID0gaHRtbC5yZXBsYWNlKFxuICAgICAgICAgIGluc2VydEFmdGVyLFxuICAgICAgICAgIGAgICAgJHtmcmFtZU1ldGFUYWd9XFxuICAke2luc2VydEFmdGVyfWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHRoZSBleGlzdGluZyBmYzptaW5pLWFwcCBKU09OIGJsb2JcbiAgICAgIGlmIChodG1sLmluY2x1ZGVzKCduYW1lPVwiZmM6bWluaS1hcHBcIicpKSB7XG4gICAgICAgIGNvbnN0IG1pbmlBcHBSZWdleCA9XG4gICAgICAgICAgLzxtZXRhXFxzK25hbWU9XCJmYzptaW5pLWFwcFwiXFxzK2NvbnRlbnQ9J1teJ10qJ1tePl0qPi87XG4gICAgICAgIGlmIChtaW5pQXBwUmVnZXgudGVzdCh1cGRhdGVkSHRtbCkpIHtcbiAgICAgICAgICB1cGRhdGVkSHRtbCA9IHVwZGF0ZWRIdG1sLnJlcGxhY2UobWluaUFwcFJlZ2V4LCBtaW5pQXBwTWV0YVRhZyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVwZGF0ZWRIdG1sO1xuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hZGl0aHlhL2NhdGFsb2cvZ2FyZGVuLWtpb3NrL3NyYy9jb25zdGFudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZGl0aHlhL2NhdGFsb2cvZ2FyZGVuLWtpb3NrL3NyYy9jb25zdGFudHMvYXBwLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hZGl0aHlhL2NhdGFsb2cvZ2FyZGVuLWtpb3NrL3NyYy9jb25zdGFudHMvYXBwLnRzXCI7Ly8gQXBwIFVSTHMgYW5kIG1ldGFkYXRhIGNvbnN0YW50c1xuZXhwb3J0IGNvbnN0IEFQUF9VUkwgPSBcImh0dHBzOi8vZ2FyZGVuYXBwLnN0YWdpbmcuamhlYi5jb21cIjtcbmV4cG9ydCBjb25zdCBBUFBfTkFNRSA9IFwiR2FyZGVuIEZpbmFuY2VcIjtcbmV4cG9ydCBjb25zdCBBUFBfREVTQ1JJUFRJT04gPSBcIkJyaWRnZSB3aXRoIEdhcmRlbiBGaW5hbmNlXCI7XG5leHBvcnQgY29uc3QgQVBQX1RBR0xJTkUgPVxuICBcIk1vdmUgQml0Y29pbi4gd2l0aG91dC4gdHJ1c3QuIEdhcmRlbiBpcyB0aGUgZmFzdGVzdCBhbmQgbW9zdCBjb3N0LWVmZmljaWVudCB3YXkgdG8gbW92ZSBuYXRpdmUgQml0Y29pbiBiZXR3ZWVuIGNoYWlucywgd2l0aG91dCBnaXZpbmcgdXAgY3VzdG9keS5cIjtcblxuLy8gRmFyY2FzdGVyIEZyYW1lIG1ldGFkYXRhXG5leHBvcnQgY29uc3QgRlJBTUVfTUVUQURBVEEgPSB7XG4gIHZlcnNpb246IFwidk5leHRcIixcbiAgaW1hZ2VVcmw6IGAke0FQUF9VUkx9L21ldGFkYXRhLnBuZ2AsXG4gIGJ1dHRvbjoge1xuICAgIHRpdGxlOiBcIkxhdW5jaCBHYXJkZW4gRmluYW5jZVwiLFxuICAgIGFjdGlvbjoge1xuICAgICAgdHlwZTogXCJsYXVuY2hfZnJhbWVcIixcbiAgICAgIG5hbWU6IEFQUF9OQU1FLFxuICAgICAgdXJsOiBBUFBfVVJMLFxuICAgICAgc3BsYXNoSW1hZ2VVcmw6IGAke0FQUF9VUkx9L21ldGFkYXRhLnBuZ2AsXG4gICAgICBzcGxhc2hCYWNrZ3JvdW5kQ29sb3I6IFwiI0ZGRkZGRlwiLFxuICAgIH0sXG4gIH0sXG59O1xuXG4vLyBNaW5pQXBwIG1ldGFkYXRhXG5leHBvcnQgY29uc3QgTUlOSV9BUFBfTUVUQURBVEEgPSB7XG4gIG5hbWU6IEFQUF9OQU1FLFxuICB2ZXJzaW9uOiBcIjFcIixcbiAgaWNvblVybDogYCR7QVBQX1VSTH0vZmF2aWNvbi5zdmdgLFxuICBob21lVXJsOiBBUFBfVVJMLFxuICBpbWFnZVVybDogYCR7QVBQX1VSTH0vbWV0YWRhdGEucG5nYCxcbiAgYnV0dG9uVGl0bGU6IFwiQnJpZGdlIHdpdGggR2FyZGVuIEZpbmFuY2VcIixcbiAgc3BsYXNoSW1hZ2VVcmw6IGAke0FQUF9VUkx9L21ldGFkYXRhLnBuZ2AsXG4gIHNwbGFzaEJhY2tncm91bmRDb2xvcjogXCIjRkZGRkZGXCIsXG4gIHdlYmhvb2tVcmw6IGAke0FQUF9VUkx9L2FwaS93ZWJob29rYCxcbiAgc3VidGl0bGU6IEFQUF9ERVNDUklQVElPTixcbiAgcHJpbWFyeUNhdGVnb3J5OiBcImZpbmFuY2VcIixcbiAgZGVzY3JpcHRpb246IEFQUF9UQUdMSU5FLFxuICBzY3JlZW5zaG90VXJsczogW2Ake0FQUF9VUkx9L21ldGFkYXRhLnBuZ2BdLFxuICBoZXJvSW1hZ2VVcmw6IGAke0FQUF9VUkx9L21ldGFkYXRhLnBuZ2AsXG4gIHRhZ3M6IFtcImJpdGNvaW5cIiwgXCJmaW5hbmNlXCIsIFwiZGVmaVwiLCBcImJyaWRnZVwiXSxcbiAgdGFnbGluZTogQVBQX0RFU0NSSVBUSU9OLFxuICBvZ1RpdGxlOiBBUFBfTkFNRSxcbiAgb2dEZXNjcmlwdGlvbjogQVBQX0RFU0NSSVBUSU9OLFxuICBvZ0ltYWdlVXJsOiBgJHtBUFBfVVJMfS9tZXRhZGF0YS5wbmdgLFxuICBjYXN0U2hhcmVVcmw6IGAke0FQUF9VUkx9L21ldGFkYXRh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SSxJQUFJLFFBQVEsa0JBQWtCO0FBQ2hDLGtCQUFNLGNBQWNELE1BQUs7QUFBQSxjQUN2QkEsTUFBSyxRQUFRLElBQUksSUFBSSx3Q0FBZSxFQUFFLFFBQVE7QUFBQSxjQUM5QztBQUFBLFlBQ0Y7QUFDQSxZQUFBQyxJQUFHLFNBQVMsYUFBYSxDQUFDLEtBQUssU0FBUztBQUN0QyxrQkFBSSxLQUFLO0FBQ1Asb0JBQUksYUFBYTtBQUNqQixvQkFBSSxJQUFJLG9CQUFvQjtBQUFBLGNBQzlCLE9BQU87QUFDTCxvQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsb0JBQUksSUFBSSxJQUFJO0FBQUEsY0FDZDtBQUFBLFlBQ0YsQ0FBQztBQUFBLFVBQ0gsT0FBTztBQUNMLGlCQUFLO0FBQUEsVUFDUDtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsS0FBS0QsTUFBSztBQUFBLFlBQ1JBLE1BQUssUUFBUSxJQUFJLElBQUksd0NBQWUsRUFBRSxRQUFRO0FBQUEsWUFDOUM7QUFBQSxVQUNGO0FBQUEsVUFDQSxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELGlCQUFpQjtBQUFBLE1BQ2YsS0FBSztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLE1BQU0sUUFBUSxJQUFJLGFBQWEsZUFBZSxDQUFDLFdBQVcsVUFBVSxJQUFJLENBQUM7QUFBQSxJQUN6RSxtQkFBbUI7QUFBQSxJQUNuQixjQUFjO0FBQUEsSUFDZCxrQkFBa0I7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1Isc0JBQXNCO0FBQUEsSUFDdEIsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNqRCxNQUFNO0FBQUEsWUFDSjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sd0JBQXdCLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDOUMsbUJBQW1CLEtBQUssVUFBVSxVQUFVO0FBQUEsRUFDOUM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgImZzIiwgInBhdGgiLCAicGF0aCIsICJmcyJdCn0K
