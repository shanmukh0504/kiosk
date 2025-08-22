import { useFrame } from "../layout/FrameProvider";
import { FRAME_METADATA } from "../constants/app";

export function useFarcasterFrame() {
  const frameContext = useFrame();

  const shareFrame = async () => {
    if (!frameContext.actions) return;

    try {
      await frameContext.actions.openUrl(FRAME_METADATA.button.action.url);
    } catch (error) {
      console.error("Error sharing frame:", error);
    }
  };

  const triggerHaptic = async (
    type: "light" | "medium" | "heavy" = "light"
  ) => {
    if (!frameContext.haptics) return;

    try {
      await frameContext.haptics.impactOccurred(type);
    } catch (error) {
      console.error("Error triggering haptic:", error);
    }
  };

  const openUrl = async (url: string) => {
    if (!frameContext.actions) return;

    try {
      await frameContext.actions.openUrl(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return {
    ...frameContext,
    shareFrame,
    triggerHaptic,
    openUrl,
  };
}
