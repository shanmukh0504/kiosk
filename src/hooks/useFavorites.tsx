import { useState, useEffect } from "react";
import { Asset } from "@gardenfi/orderbook";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("tokenFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (asset: Asset) => {
    const assetId = `${asset.chain}-${asset.atomicSwapAddress}`;
    const newFavorites = favorites.includes(assetId)
      ? favorites.filter((id) => id !== assetId)
      : [...favorites, assetId];

    setFavorites(newFavorites);
    localStorage.setItem("tokenFavorites", JSON.stringify(newFavorites));
  };

  const isFavorite = (asset: Asset) => {
    return favorites.includes(`${asset.chain}-${asset.atomicSwapAddress}`);
  };

  const sortAssetsByFavorites = (assets: Asset[]) => {
    return [...assets].sort((a, b) => {
      const aFav = isFavorite(a);
      const bFav = isFavorite(b);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  };

  return { favorites, toggleFavorite, isFavorite, sortAssetsByFavorites };
};
