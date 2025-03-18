// vite.config.ts
import { defineConfig } from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { execSync } from "child_process";
import { viteStaticCopy } from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/vite-plugin-static-copy/dist/index.js";
import path2 from "path";
import wasm from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/vite-plugin-wasm/exports/import.mjs";
import { nodePolyfills } from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/vite-plugin-node-polyfills/dist/index.js";
import topLevelAwait from "file:///C:/Users/Pc/Desktop/x/garden-kiosk/node_modules/vite-plugin-top-level-await/exports/import.mjs";

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
        const html = originalHtml.replace(/<!--meta-title-->/g, metadata.title).replace(/<!--meta-og-title-->/g, metadata.title).replace(/<!--meta-description-->/g, metadata.description).replace(/<!--meta-og-description-->/g, metadata.description).replace(/<!--meta-og-image-->/g, metadata.ogImage).replace(/<!--meta-twt-image-->/g, metadata.ogImage);
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
        const routesToPrerender = ["/", "/swap", "/stake", "/quest"];
        for (const route of routesToPrerender) {
          const metadata = generatePageMetadata(route);
          const html = template.replace(/<!--meta-title-->/g, metadata.title).replace(/<!--meta-og-title-->/g, metadata.title).replace(/<!--meta-description-->/g, metadata.description).replace(/<!--meta-og-description-->/g, metadata.description).replace(/<!--meta-og-image-->/g, metadata.ogImage).replace(/<!--meta-twt-image-->/g, metadata.ogImage);
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
      title: "Garden Finance BTC Bridge: Swap Native Bitcoin",
      description: "Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more.",
      keywords: [
        "Garden",
        "Bitcoin exchange",
        "Bitcoin bridge",
        "fast BTC bridge",
        "instant BTC bridge",
        "decentralized BTC swap",
        "atomic swap",
        "cross-chain swap"
      ],
      ogImage: "/metadata.png",
      canonical: "/"
    },
    "/stake": {
      title: "Garden Finance: Stake SEED Token",
      description: "Stake SEED tokens to get revenue share and participate in governance while earning APY.",
      keywords: [
        "SEED token staking",
        "earn APY on SEED tokens",
        "Garden Finance governance"
      ],
      ogImage: "/stake.png",
      canonical: "/stake"
    },
    "/quest": {
      title: "Garden Finance Quests",
      description: "Get involved in the Garden ecosystem and earn SEED tokens by completing quests.",
      keywords: [
        "Earn SEED tokens",
        "SEED token rewards",
        "SEED token airdrop"
      ],
      ogImage: "/quest.png",
      canonical: "/quest"
    }
  };
  if (path3 === "/swap") {
    return baseMetadata["/"];
  }
  return baseMetadata[path3] || baseMetadata["/"];
}

// vite.config.ts
var __vite_injected_original_import_meta_url = "file:///C:/Users/Pc/Desktop/x/garden-kiosk/vite.config.ts";
var getRecentGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Failed to get Git commit hash", error);
    return "unknown";
  }
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
    })
    // {
    //   name: "generate-build-id",
    //   buildEnd() {
    //     generateBuildIdFile();
    //   },
    //   configureServer(server) {
    //     generateBuildIdFile();
    //     // Have to write a custom middleware to serve the build Id file,
    //     // because vite dev server doesn't serve files from public directory as soon as they are generated.
    //     server.middlewares.use((req, res, next) => {
    //       if (req.url === "/build-id.json") {
    //         const buildIdPath = path.resolve(
    //           path.dirname(new URL(import.meta.url).pathname),
    //           "public/build-id.json"
    //         );
    //         fs.readFile(buildIdPath, (err, data) => {
    //           if (err) {
    //             res.statusCode = 404;
    //             res.end("Build ID not found");
    //           } else {
    //             res.setHeader("Content-Type", "application/json");
    //             res.end(data);
    //           }
    //         });
    //       } else {
    //         next();
    //       }
    //     });
    //   },
    // },
  ],
  preview: {
    allowedHosts: true
  },
  define: {
    "process.env.BUILD_ID": JSON.stringify(buildId)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1tZXRhZGF0YS1wbHVnaW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQY1xcXFxEZXNrdG9wXFxcXHhcXFxcZ2FyZGVuLWtpb3NrXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQY1xcXFxEZXNrdG9wXFxcXHhcXFxcZ2FyZGVuLWtpb3NrXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QYy9EZXNrdG9wL3gvZ2FyZGVuLWtpb3NrL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHdhc20gZnJvbSBcInZpdGUtcGx1Z2luLXdhc21cIjtcclxuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xyXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tIFwidml0ZS1wbHVnaW4tdG9wLWxldmVsLWF3YWl0XCI7XHJcbmltcG9ydCB7IG1ldGFkYXRhUGx1Z2luIH0gZnJvbSBcIi4vdml0ZS1tZXRhZGF0YS1wbHVnaW5cIjtcclxuXHJcbmNvbnN0IGdldFJlY2VudEdpdENvbW1pdEhhc2ggPSAoKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBleGVjU3luYyhcImdpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEXCIpLnRvU3RyaW5nKCkudHJpbSgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGdldCBHaXQgY29tbWl0IGhhc2hcIiwgZXJyb3IpO1xyXG4gICAgcmV0dXJuIFwidW5rbm93blwiO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IGdlbmVyYXRlQnVpbGRJZEZpbGUgPSAoKSA9PiB7XHJcbiAgY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSk7XHJcbiAgY29uc3QgYnVpbGRJZFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInB1YmxpYy9idWlsZC1pZC5qc29uXCIpO1xyXG4gIGZzLndyaXRlRmlsZVN5bmMoYnVpbGRJZFBhdGgsIEpTT04uc3RyaW5naWZ5KHsgYnVpbGRJZCB9LCBudWxsLCAyKSk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZElkID0gZ2V0UmVjZW50R2l0Q29tbWl0SGFzaCgpO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgd2FzbSgpLFxyXG4gICAgbWV0YWRhdGFQbHVnaW4oKSxcclxuICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcclxuICAgICAgICBCdWZmZXI6IHRydWUsXHJcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICB0b3BMZXZlbEF3YWl0KCksXHJcbiAgICB2aXRlU3RhdGljQ29weSh7XHJcbiAgICAgIHRhcmdldHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6IHBhdGgucmVzb2x2ZShcclxuICAgICAgICAgICAgcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSksXHJcbiAgICAgICAgICAgIFwiYnVpbGQtaWQuanNvblwiXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgZGVzdDogXCJwdWJsaWNcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8ge1xyXG4gICAgLy8gICBuYW1lOiBcImdlbmVyYXRlLWJ1aWxkLWlkXCIsXHJcbiAgICAvLyAgIGJ1aWxkRW5kKCkge1xyXG4gICAgLy8gICAgIGdlbmVyYXRlQnVpbGRJZEZpbGUoKTtcclxuICAgIC8vICAgfSxcclxuICAgIC8vICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgLy8gICAgIGdlbmVyYXRlQnVpbGRJZEZpbGUoKTtcclxuICAgIC8vICAgICAvLyBIYXZlIHRvIHdyaXRlIGEgY3VzdG9tIG1pZGRsZXdhcmUgdG8gc2VydmUgdGhlIGJ1aWxkIElkIGZpbGUsXHJcbiAgICAvLyAgICAgLy8gYmVjYXVzZSB2aXRlIGRldiBzZXJ2ZXIgZG9lc24ndCBzZXJ2ZSBmaWxlcyBmcm9tIHB1YmxpYyBkaXJlY3RvcnkgYXMgc29vbiBhcyB0aGV5IGFyZSBnZW5lcmF0ZWQuXHJcbiAgICAvLyAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgIC8vICAgICAgIGlmIChyZXEudXJsID09PSBcIi9idWlsZC1pZC5qc29uXCIpIHtcclxuICAgIC8vICAgICAgICAgY29uc3QgYnVpbGRJZFBhdGggPSBwYXRoLnJlc29sdmUoXHJcbiAgICAvLyAgICAgICAgICAgcGF0aC5kaXJuYW1lKG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZSksXHJcbiAgICAvLyAgICAgICAgICAgXCJwdWJsaWMvYnVpbGQtaWQuanNvblwiXHJcbiAgICAvLyAgICAgICAgICk7XHJcbiAgICAvLyAgICAgICAgIGZzLnJlYWRGaWxlKGJ1aWxkSWRQYXRoLCAoZXJyLCBkYXRhKSA9PiB7XHJcbiAgICAvLyAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgLy8gICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XHJcbiAgICAvLyAgICAgICAgICAgICByZXMuZW5kKFwiQnVpbGQgSUQgbm90IGZvdW5kXCIpO1xyXG4gICAgLy8gICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgIC8vICAgICAgICAgICAgIHJlcy5lbmQoZGF0YSk7XHJcbiAgICAvLyAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgIG5leHQoKTtcclxuICAgIC8vICAgICAgIH1cclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0sXHJcbiAgXSxcclxuICBwcmV2aWV3OiB7XHJcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXHJcbiAgfSxcclxuICBkZWZpbmU6IHtcclxuICAgIFwicHJvY2Vzcy5lbnYuQlVJTERfSURcIjogSlNPTi5zdHJpbmdpZnkoYnVpbGRJZCksXHJcbiAgfSxcclxufSk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcUGNcXFxcRGVza3RvcFxcXFx4XFxcXGdhcmRlbi1raW9za1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcUGNcXFxcRGVza3RvcFxcXFx4XFxcXGdhcmRlbi1raW9za1xcXFx2aXRlLW1ldGFkYXRhLXBsdWdpbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvUGMvRGVza3RvcC94L2dhcmRlbi1raW9zay92aXRlLW1ldGFkYXRhLXBsdWdpbi50c1wiO2ltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnLCBWaXRlRGV2U2VydmVyIH0gZnJvbSBcInZpdGVcIjtcclxuXHJcbmludGVyZmFjZSBNZXRhZGF0YSB7XHJcbiAgdGl0bGU6IHN0cmluZztcclxuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gIGtleXdvcmRzOiBzdHJpbmdbXTtcclxuICBvZ0ltYWdlOiBzdHJpbmc7XHJcbiAgY2Fub25pY2FsOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXRhZGF0YVBsdWdpbigpOiBQbHVnaW4ge1xyXG4gIGxldCBjb25maWc6IFJlc29sdmVkQ29uZmlnO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJ2aXRlLW1ldGFkYXRhLXBsdWdpblwiLFxyXG4gICAgZW5mb3JjZTogXCJwb3N0XCIsXHJcblxyXG4gICAgY29uZmlnUmVzb2x2ZWQocmVzb2x2ZWRDb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XHJcbiAgICAgIGNvbmZpZyA9IHJlc29sdmVkQ29uZmlnO1xyXG4gICAgfSxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICBpZiAoIXJlcS51cmwpIHJldHVybiBuZXh0KCk7XHJcblxyXG4gICAgICAgIC8vIEF2b2lkIHNlcnZpbmcgSFRNTCBmb3IgbW9kdWxlIGFuZCBhc3NldCByZXF1ZXN0c1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICFyZXEudXJsLmVuZHNXaXRoKFwiLmh0bWxcIikgJiZcclxuICAgICAgICAgICFyZXEuaGVhZGVycy5hY2NlcHQ/LmluY2x1ZGVzKFwidGV4dC9odG1sXCIpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmV4dCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm91dGUgPSByZXEudXJsID09PSBcIi9cIiA/IFwiL1wiIDogcmVxLnVybC5zcGxpdChcIj9cIilbMF0gfHwgXCIvXCI7XHJcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBnZW5lcmF0ZVBhZ2VNZXRhZGF0YShyb3V0ZSk7XHJcblxyXG4gICAgICAgIC8vIFVzZSBWaXRlJ3MgbmF0aXZlIEhUTUwgaGFuZGxlciBmaXJzdFxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbCA9IGF3YWl0IHNlcnZlci50cmFuc2Zvcm1JbmRleEh0bWwoXHJcbiAgICAgICAgICByZXEudXJsLFxyXG4gICAgICAgICAgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihjb25maWcucm9vdCwgXCJpbmRleC5odG1sXCIpLCBcInV0Zi04XCIpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gSW5qZWN0IG1ldGFkYXRhIGludG8gdGhlIEhUTUxcclxuICAgICAgICBjb25zdCBodG1sID0gb3JpZ2luYWxIdG1sXHJcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXHJcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXHJcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXHJcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctZGVzY3JpcHRpb24tLT4vZywgbWV0YWRhdGEuZGVzY3JpcHRpb24pXHJcbiAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSlcclxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS10d3QtaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSk7XHJcblxyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L2h0bWxcIik7XHJcbiAgICAgICAgcmVzLmVuZChodG1sKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlQnVuZGxlKCkge1xyXG4gICAgICAvLyBPbmx5IHJ1biBpbiBidWlsZCBtb2RlXHJcbiAgICAgIGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJidWlsZFwiKSB7XHJcbiAgICAgICAgLy8gUmVhZCB0aGUgdGVtcGxhdGVcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhcclxuICAgICAgICAgIHBhdGguam9pbihjb25maWcuYnVpbGQub3V0RGlyLCBcImluZGV4Lmh0bWxcIiksXHJcbiAgICAgICAgICBcInV0Zi04XCJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCByb3V0ZXNUb1ByZXJlbmRlciA9IFtcIi9cIiwgXCIvc3dhcFwiLCBcIi9zdGFrZVwiLCBcIi9xdWVzdFwiXTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCByb3V0ZSBvZiByb3V0ZXNUb1ByZXJlbmRlcikge1xyXG4gICAgICAgICAgLy8gR2VuZXJhdGUgbWV0YWRhdGEgZm9yIHRoaXMgcm91dGVcclxuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gZ2VuZXJhdGVQYWdlTWV0YWRhdGEocm91dGUpO1xyXG5cclxuICAgICAgICAgIC8vIEluamVjdCBtZXRhZGF0YSBpbnRvIHRlbXBsYXRlXHJcbiAgICAgICAgICBjb25zdCBodG1sID0gdGVtcGxhdGVcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLXRpdGxlLS0+L2csIG1ldGFkYXRhLnRpdGxlKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctdGl0bGUtLT4vZywgbWV0YWRhdGEudGl0bGUpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tbWV0YS1kZXNjcmlwdGlvbi0tPi9nLCBtZXRhZGF0YS5kZXNjcmlwdGlvbilcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLW9nLWRlc2NyaXB0aW9uLS0+L2csIG1ldGFkYXRhLmRlc2NyaXB0aW9uKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPCEtLW1ldGEtb2ctaW1hZ2UtLT4vZywgbWV0YWRhdGEub2dJbWFnZSlcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS1tZXRhLXR3dC1pbWFnZS0tPi9nLCBtZXRhZGF0YS5vZ0ltYWdlKTtcclxuXHJcbiAgICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgY29ycmVjdCBmaWxlIHBhdGhcclxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID1cclxuICAgICAgICAgICAgcm91dGUgPT09IFwiL1wiXHJcbiAgICAgICAgICAgICAgPyBwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgXCJpbmRleC5odG1sXCIpXHJcbiAgICAgICAgICAgICAgOiBwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgYCR7cm91dGUuc2xpY2UoMSl9Lmh0bWxgKTtcclxuXHJcbiAgICAgICAgICAvLyBXcml0ZSB0aGUgZmlsZVxyXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgaHRtbCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGVkICR7cm91dGV9IGF0ICR7ZmlsZVBhdGh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlUGFnZU1ldGFkYXRhKHBhdGg6IHN0cmluZyk6IE1ldGFkYXRhIHtcclxuICBjb25zdCBiYXNlTWV0YWRhdGE6IFJlY29yZDxzdHJpbmcsIE1ldGFkYXRhPiA9IHtcclxuICAgIFwiL1wiOiB7XHJcbiAgICAgIHRpdGxlOiBcIkdhcmRlbiBGaW5hbmNlIEJUQyBCcmlkZ2U6IFN3YXAgTmF0aXZlIEJpdGNvaW5cIixcclxuICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgXCJFZmZvcnRsZXNzbHkgYnJpZGdlIG5hdGl2ZSBCaXRjb2luIHRvIGNoYWlucyBsaWtlIFNvbGFuYSwgRXRoZXJldW0sIEJhc2UsIEFyYml0cnVtLCBBdmFsYW5jaGUsIGFuZCBtb3JlLlwiLFxyXG4gICAgICBrZXl3b3JkczogW1xyXG4gICAgICAgIFwiR2FyZGVuXCIsXHJcbiAgICAgICAgXCJCaXRjb2luIGV4Y2hhbmdlXCIsXHJcbiAgICAgICAgXCJCaXRjb2luIGJyaWRnZVwiLFxyXG4gICAgICAgIFwiZmFzdCBCVEMgYnJpZGdlXCIsXHJcbiAgICAgICAgXCJpbnN0YW50IEJUQyBicmlkZ2VcIixcclxuICAgICAgICBcImRlY2VudHJhbGl6ZWQgQlRDIHN3YXBcIixcclxuICAgICAgICBcImF0b21pYyBzd2FwXCIsXHJcbiAgICAgICAgXCJjcm9zcy1jaGFpbiBzd2FwXCIsXHJcbiAgICAgIF0sXHJcbiAgICAgIG9nSW1hZ2U6IFwiL21ldGFkYXRhLnBuZ1wiLFxyXG4gICAgICBjYW5vbmljYWw6IFwiL1wiLFxyXG4gICAgfSxcclxuICAgIFwiL3N0YWtlXCI6IHtcclxuICAgICAgdGl0bGU6IFwiR2FyZGVuIEZpbmFuY2U6IFN0YWtlIFNFRUQgVG9rZW5cIixcclxuICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgXCJTdGFrZSBTRUVEIHRva2VucyB0byBnZXQgcmV2ZW51ZSBzaGFyZSBhbmQgcGFydGljaXBhdGUgaW4gZ292ZXJuYW5jZSB3aGlsZSBlYXJuaW5nIEFQWS5cIixcclxuICAgICAga2V5d29yZHM6IFtcclxuICAgICAgICBcIlNFRUQgdG9rZW4gc3Rha2luZ1wiLFxyXG4gICAgICAgIFwiZWFybiBBUFkgb24gU0VFRCB0b2tlbnNcIixcclxuICAgICAgICBcIkdhcmRlbiBGaW5hbmNlIGdvdmVybmFuY2VcIixcclxuICAgICAgXSxcclxuICAgICAgb2dJbWFnZTogXCIvc3Rha2UucG5nXCIsXHJcbiAgICAgIGNhbm9uaWNhbDogXCIvc3Rha2VcIixcclxuICAgIH0sXHJcbiAgICBcIi9xdWVzdFwiOiB7XHJcbiAgICAgIHRpdGxlOiBcIkdhcmRlbiBGaW5hbmNlIFF1ZXN0c1wiLFxyXG4gICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICBcIkdldCBpbnZvbHZlZCBpbiB0aGUgR2FyZGVuIGVjb3N5c3RlbSBhbmQgZWFybiBTRUVEIHRva2VucyBieSBjb21wbGV0aW5nIHF1ZXN0cy5cIixcclxuICAgICAga2V5d29yZHM6IFtcclxuICAgICAgICBcIkVhcm4gU0VFRCB0b2tlbnNcIixcclxuICAgICAgICBcIlNFRUQgdG9rZW4gcmV3YXJkc1wiLFxyXG4gICAgICAgIFwiU0VFRCB0b2tlbiBhaXJkcm9wXCIsXHJcbiAgICAgIF0sXHJcbiAgICAgIG9nSW1hZ2U6IFwiL3F1ZXN0LnBuZ1wiLFxyXG4gICAgICBjYW5vbmljYWw6IFwiL3F1ZXN0XCIsXHJcbiAgICB9LFxyXG4gIH07XHJcblxyXG4gIGlmIChwYXRoID09PSBcIi9zd2FwXCIpIHtcclxuICAgIHJldHVybiBiYXNlTWV0YWRhdGFbXCIvXCJdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJhc2VNZXRhZGF0YVtwYXRoXSB8fCBiYXNlTWV0YWRhdGFbXCIvXCJdO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1MsU0FBUyxvQkFBb0I7QUFDalUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsc0JBQXNCO0FBQy9CLE9BQU9BLFdBQVU7QUFFakIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sbUJBQW1COzs7QUNSNFIsT0FBTyxRQUFRO0FBQ3JV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QUNBLFVBQVU7QUFBQSxNQUNSLE9BQU87QUFBQSxNQUNQLGFBQ0U7QUFBQSxNQUNGLFVBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVCxXQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFFQSxNQUFJQSxVQUFTLFNBQVM7QUFDcEIsV0FBTyxhQUFhLEdBQUc7QUFBQSxFQUN6QjtBQUVBLFNBQU8sYUFBYUEsS0FBSSxLQUFLLGFBQWEsR0FBRztBQUMvQzs7O0FEbEp1TCxJQUFNLDJDQUEyQztBQVd4TyxJQUFNLHlCQUF5QixNQUFNO0FBQ25DLE1BQUk7QUFDRixXQUFPLFNBQVMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLEtBQUs7QUFBQSxFQUNoRSxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0saUNBQWlDLEtBQUs7QUFDcEQsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQVFBLElBQU0sVUFBVSx1QkFBdUI7QUFHdkMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLElBQ0wsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1QsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLQyxNQUFLO0FBQUEsWUFDUkEsTUFBSyxRQUFRLElBQUksSUFBSSx3Q0FBZSxFQUFFLFFBQVE7QUFBQSxZQUM5QztBQUFBLFVBQ0Y7QUFBQSxVQUNBLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBZ0NIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLHdCQUF3QixLQUFLLFVBQVUsT0FBTztBQUFBLEVBQ2hEO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCIsICJwYXRoIiwgInBhdGgiXQp9Cg==
