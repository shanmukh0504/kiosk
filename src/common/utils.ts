import { INTERNAL_ROUTES, THEMES } from "./constants";

export const isProduction = () => {
  return import.meta.env.VITE_ENVIRONMENT === "production";
};

export const getCurrentTheme = () => {
  const path = window.location.pathname;
  if (path === INTERNAL_ROUTES.swap.path) return THEMES.swap;
  if (path === INTERNAL_ROUTES.quests.path) return THEMES.quests;
  throw new Error("Invalid theme");
};
