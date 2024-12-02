import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const generatePageMetadata = (path) => {
  const baseMetadata = {
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
    "/quest": {
      title:"Native Bitcoin Exchange | Garden BTC Bridge",
      description:"Experience fast, secure, and trustless BTC bridging across most blockchains, including Arbitrum, Ethereum, Avalanche, Optimism, and Binance.",
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
      ogImage: "/act2.png",
        canonical:"/quest"
    }
    // Add more routes as needed
  };

  // Return metadata for the current route, or default if not found
  return baseMetadata[path] || {
    title: "Garden Finance BTC Bridge: Swap Native Bitcoin",
    description:
      "Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more.",
    ogImage: "/metadata.png",
    canonical: "/",
  };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

// Read the HTML template to inject metadata
const template = fs.readFileSync(toAbsolute("dist/index.html"), "utf-8");

// Explicit list of routes to pre-render (including "/swap" and "/quest")
const routesToPrerender = ["/" , "/quest"];

// Function to pre-render the HTML for each route
(async () => {
  for (const url of routesToPrerender) {
    // Generate metadata for the current route
    const metadata = generatePageMetadata(url);

    // Inject metadata into the template
    const html = template
      .replace("<!--meta-title-->", metadata.title) // Inject title
      .replace("<!--meta-description-->", metadata.description)
      .replace("<!--meta-og-description-->", metadata.ogDescription || metadata.description) // Inject description
      .replace("<!--meta-og-image-->", metadata.ogImage || "/metadata.png"); // Inject Open Graph image

    // Define the file path where the pre-rendered HTML will be saved
    const filePath = `dist${url === "/" ? "/index" : url}.html`;

    // Write the generated HTML to a file
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log(`Prerendered: ${filePath}`); // Log the rendered file path
  }
})();