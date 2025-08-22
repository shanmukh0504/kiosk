import { Plugin } from "vite";
import { FRAME_METADATA, MINI_APP_METADATA } from "./src/constants/app";

export function frameMetadataPlugin(): Plugin {
  return {
    name: "frame-metadata",
    transformIndexHtml(html) {
      // Inject fc:frame metadata
      const frameMetaTag = `<meta name="fc:frame" content='${JSON.stringify(FRAME_METADATA)}' />`;

      // Inject updated mini-app metadata
      const miniAppMetaTag = `<meta name="fc:mini-app" content='${JSON.stringify(MINI_APP_METADATA)}' />`;

      // Replace existing fc:frame meta tag if it exists, otherwise add it
      let updatedHtml = html;

      // Check if fc:frame meta tag already exists
      if (html.includes('name="fc:frame"')) {
        updatedHtml = html.replace(/<meta name="fc:frame"[^>]*>/, frameMetaTag);
      } else {
        // Add after the existing fc:mini-app tags
        const insertAfter = "</head>";
        updatedHtml = html.replace(
          insertAfter,
          `    ${frameMetaTag}\n  ${insertAfter}`
        );
      }

      // Update the existing fc:mini-app JSON blob
      if (html.includes('name="fc:mini-app"')) {
        const miniAppRegex =
          /<meta\s+name="fc:mini-app"\s+content='[^']*'[^>]*>/;
        if (miniAppRegex.test(updatedHtml)) {
          updatedHtml = updatedHtml.replace(miniAppRegex, miniAppMetaTag);
        }
      }

      return updatedHtml;
    },
  };
}
