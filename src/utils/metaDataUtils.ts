export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

const generatePageMetadata = (path: string): PageMetadata => {
  const baseMetadata: Record<string, PageMetadata> = {
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

  return (
    baseMetadata[path] || {
      title: "Garden Finance BTC Bridge: Swap Native Bitcoin",
      description:
        "Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more.",
      ogImage: "/metadata.png",
      canonical: "/",
    }
  );
};

export default generatePageMetadata;
