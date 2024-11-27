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

// Create the necessary path resolver (for ES module compatibility)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

// Read the template HTML file that will be used for each route
const template = fs.readFileSync(toAbsolute("dist/static/index.html"), "utf-8");

// Determine routes to pre-render by reading the `src/pages` directory
const routesToPrerender = fs
  .readdirSync(toAbsolute("src/pages"))
  .map((file) => {
    const name = file.replace(/\.tsx$/, "").toLowerCase();
    return name === "home" ? "/" : `/${name}`;
  });

(async () => {
  // Pre-render each route and generate a static HTML file for it
  for (const url of routesToPrerender) {
    // Generate the metadata for the current route
    const metadata = generatePageMetadata(url);

    // Inject the appropriate metadata into the HTML template
    const html = template
      .replace("<!--meta-title-->", metadata.title) // Inject meta title
      .replace("<!--meta-description-->", metadata.description) // Inject meta description
      .replace("<!--meta-og-image-->", metadata.ogImage || "/metadata.png"); // Inject Open Graph image

    // Determine the correct file path for the static HTML output
    const filePath = `dist/static${url === "/" ? "/index" : url}.html`;

    // Write the generated HTML to a file
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log(`Prerendered: ${filePath}`); // Log each prerendered file path
  }
})();
