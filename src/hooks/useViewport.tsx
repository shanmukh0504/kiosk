import { useState, useEffect, useCallback, useMemo } from "react";
import { BREAKPOINTS } from "../constants/constants";

type Viewport = {
  width: number;
  height: number;
  isMobile: boolean;
};

export const useViewport = (): Viewport => {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const isMobile = useMemo(() => {
    return (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      viewport.width < BREAKPOINTS.sm
    );
  }, [viewport.width]);

  const handleResize = useCallback(() => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    handleResize();
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return { ...viewport, isMobile };
};
