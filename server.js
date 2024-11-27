import { createApp } from "h3";
import { listen } from "listhen";
import sirv from "sirv";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Helper function to resolve file paths
const resolve = (p) => path.resolve(__dirname, p);

const bootstrap = async () => {
  const app = createApp();

  // Serve static files (JS, CSS, etc.) from dist/client
  app.use(sirv("dist/client", { gzip: true }));

  // Handle SSR for all routes
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Read the template HTML (this is the file that contains placeholders)
      const template = fs.readFileSync(resolve("dist/client/index.html"), "utf-8");

      // Import the SSR render function from the server entry (entry-server.js)
      const { SSRRender } = await import("./dist/server/entry-server.js");

      // Render the HTML content from SSR for the requested URL
      const appHtml = SSRRender(url); // Here, SSR renders the React components without client-side hydration (de-hydrated)

      // Replace placeholders in the template with SSR-rendered HTML
      const finalHtml = template.replace("<!--ssr-outlet-->", appHtml);

      // Optionally manipulate metadata (e.g., title, description)
      const metadata = { title: "My App", description: "An SSR Example" }; // Adjust dynamically as needed
      const htmlWithMetadata = finalHtml
        .replace("<!--meta-title-->", metadata.title)
        .replace("<!--meta-description-->", metadata.description);

      // Send the final HTML with injected SSR content and metadata
      res.status(200).set({ "Content-Type": "text/html" }).end(htmlWithMetadata);
    } catch (error) {
      // Handle any errors
      next(error);
    }
  });

  return { app };
};

// Start the server on port 3333
bootstrap()
  .then(async ({ app }) => {
    await listen(app, { port: 3333 });
    console.log("Server running on http://localhost:3333");
  })
  .catch(console.error);
