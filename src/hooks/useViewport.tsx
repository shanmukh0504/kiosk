import { useState, useEffect, useCallback } from "react";

type Viewport = {
  width: number;
  height: number;
};

export const useViewport = (): Viewport => {
  const [viewport, setViewport] = useState<Viewport>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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

  return viewport;
};
