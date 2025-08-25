// App URLs and metadata constants
export const APP_URL = "https://gardenapp.staging.jheb.com";
export const APP_NAME = "Garden Finance";
export const APP_DESCRIPTION = "Bridge with Garden Finance";
export const APP_TAGLINE =
  "Move Bitcoin. without. trust. Garden is the fastest and most cost-efficient way to move native Bitcoin between chains, without giving up custody.";

// Farcaster Frame metadata
export const FRAME_METADATA = {
  version: "next",
  imageUrl: `${APP_URL}/metadata.png`,
  button: {
    title: "Launch Garden Finance",
    action: {
      type: "launch_frame",
      name: APP_NAME,
      url: APP_URL,
      splashImageUrl: `${APP_URL}/icon.png`,
      splashBackgroundColor: "#E4EBF2",
    },
  },
};

// MiniApp metadata
export const MINI_APP_METADATA = {
  name: APP_NAME,
  version: "1",
  iconUrl: `${APP_URL}/favicon.svg`,
  homeUrl: APP_URL,
  imageUrl: `${APP_URL}/metadata.png`,
  buttonTitle: "Bridge with Garden Finance",
  splashImageUrl: `${APP_URL}/icon.png`,
  splashBackgroundColor: "#E4EBF2",
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
  castShareUrl: `${APP_URL}/metadata.png`,
};
