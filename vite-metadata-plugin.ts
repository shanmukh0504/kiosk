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
          .replace(/<!--meta-twt-image-->/g, metadata.ogImage)
          .replace(/<!--meta-keywords-->/g, metadata.keywords.join(", "))
          .replace(/<!--meta-canonical-->/g, metadata.canonical);

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
        const isTestnet = config.env.VITE_NETWORK === "testnet";
        // Only prerender /stake if not testnet
        const routesToPrerender = isTestnet
          ? ["/", "/swap"]
          : ["/", "/swap", "/stake"];
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
            .replace(/<!--meta-twt-image-->/g, metadata.ogImage)
            .replace(/<!--meta-keywords-->/g, metadata.keywords.join(", "))
            .replace(/<!--meta-canonical-->/g, metadata.canonical);

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
      title: "Bridge BTC to Ethereum, Arbitrum, Base, Hyperliquid | Garden",
      description:
        "Bridge BTC across Ethereum, Arbitrum, Base, Berachain, Hyperliquid & more. Swap BTC, wBTC, cbBTC, USDC, and LBTC with fast, trustless settlements via Garden.",
      keywords: [
        "bitcoin hyperliquid bridge",
        "btc to wbtc swap",
        "cross chain bitcoin bridge",
        "trustless btc bridge",
        "btc to cbBTC bridge",
      ],
      ogImage: "/metadata.png",
      canonical: "/",
    },
    "/stake": {
      title: "Stake SEED Token | Earn APY & Join Governance | Garden",
      description:
        "Stake your SEED tokens with Garden to earn APY, share in protocol revenue, and join governance decisions.",
      keywords: [
        "seed token staking",
        "earn apy on seed",
        "garden finance governance",
        "stake seed token",
      ],
      ogImage: "/stake.png",
      canonical: "/stake",
    },
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

  if (path === "/swap") {
    return baseMetadata["/"];
  }

  return baseMetadata[path] || baseMetadata["/"];
}
