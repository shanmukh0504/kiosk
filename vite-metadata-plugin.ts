import fs from "fs";
import path from "path";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

interface Metadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
}

export function metadataPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "vite-metadata-plugin",
    enforce: "post",

    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // Avoid serving HTML for module and asset requests
        if (
          !req.url.endsWith(".html") &&
          !req.headers.accept?.includes("text/html")
        ) {
          return next();
        }

        const route = req.url === "/" ? "/" : req.url.split("?")[0] || "/";
        const metadata = generatePageMetadata(route);

        // Use Vite's native HTML handler first
        const originalHtml = await server.transformIndexHtml(
          req.url,
          fs.readFileSync(path.join(config.root, "index.html"), "utf-8")
        );

        // Inject metadata into the HTML
        const html = originalHtml
          .replace(/<!--meta-title-->/g, metadata.title)
          .replace(/<!--meta-og-title-->/g, metadata.title)
          .replace(/<!--meta-description-->/g, metadata.description)
          .replace(/<!--meta-og-description-->/g, metadata.description)
          .replace(/<!--meta-og-image-->/g, metadata.ogImage)
          .replace(/<!--meta-twt-image-->/g, metadata.ogImage);

        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });
    },

    closeBundle() {
      // Only run in build mode
      if (config.command === "build") {
        // Read the template
        const template = fs.readFileSync(
          path.join(config.build.outDir, "index.html"),
          "utf-8"
        );

        const routesToPrerender = ["/", "/swap", "/stake", "/quest"];

        for (const route of routesToPrerender) {
          // Generate metadata for this route
          const metadata = generatePageMetadata(route);

          // Inject metadata into template
          const html = template
            .replace(/<!--meta-title-->/g, metadata.title)
            .replace(/<!--meta-og-title-->/g, metadata.title)
            .replace(/<!--meta-description-->/g, metadata.description)
            .replace(/<!--meta-og-description-->/g, metadata.description)
            .replace(/<!--meta-og-image-->/g, metadata.ogImage)
            .replace(/<!--meta-twt-image-->/g, metadata.ogImage);

          // Generate the correct file path
          const filePath =
            route === "/"
              ? path.join(config.build.outDir, "index.html")
              : path.join(config.build.outDir, `${route.slice(1)}.html`);

          // Write the file
          fs.writeFileSync(filePath, html);
          console.log(`Generated ${route} at ${filePath}`);
        }
      }
    },
  };
}

function generatePageMetadata(path: string): Metadata {
  const baseMetadata: Record<string, Metadata> = {
    "/": {
      title: "Garden Finance BTC Bridge: Swap Native Bitcoin",
      description:
        "Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more.",
      keywords: [
        "Garden",
        "Bitcoin exchange",
        "Bitcoin bridge",
        "fast BTC bridge",
        "instant BTC bridge",
        "decentralized BTC swap",
        "atomic swap",
        "cross-chain swap",
      ],
      ogImage: "/metadata.png",
      canonical: "/",
    },
    "/stake": {
      title: "Garden Finance: Stake SEED Token",
      description:
        "Stake SEED tokens to get revenue share and participate in governance while earning APY.",
      keywords: [
        "SEED token staking",
        "earn APY on SEED tokens",
        "Garden Finance governance",
      ],
      ogImage: "/stake.png",
      canonical: "/stake",
    },
    "/quest": {
      title: "Garden Finance Quests",
      description:
        "Get involved in the Garden ecosystem and earn SEED tokens by completing quests.",
      keywords: [
        "Earn SEED tokens",
        "SEED token rewards",
        "SEED token airdrop",
      ],
      ogImage: "/quest.png",
      canonical: "/quest",
    },
  };

  if (path === "/swap") {
    return baseMetadata["/"];
  }

  return baseMetadata[path] || baseMetadata["/"];
}
