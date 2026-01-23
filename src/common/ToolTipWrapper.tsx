import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Portal } from "../components/Portal";
import { viewPortStore } from "../store/viewPortStore";

// Accept targetRef as a prop
interface TooltipWrapperProps {
  children: ReactNode;
  targetRef: React.RefObject<HTMLElement>;
  offsetY?: number;
  offsetX?: number;
  title?: string;
}

export const TooltipWrapper: FC<TooltipWrapperProps> = ({
  children,
  targetRef,
  offsetY = 17,
  offsetX = 10,
  title,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { isMobile } = viewPortStore();

  useEffect(() => {
    if (!targetRef?.current || !tooltipRef.current) return;
    const computedOffsetY = isMobile ? -21 : offsetY;
    const computedOffsetX = isMobile ? -29 : offsetX;
    const updatePosition = () => {
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPosition({
        top: rect.top - computedOffsetY,
        left: rect.right + computedOffsetX,
      });
    };

    const handleScroll = () => {
      setIsVisible(false);
    };

    // Initial position update
    updatePosition();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, true);

    // Add resize event listener
    window.addEventListener("resize", updatePosition);

    // Add resize observer to track target position changes
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    if (targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
    };
  }, [targetRef]); // Only depend on targetRef

  if (!isVisible) return null;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 9999,
            pointerEvents: "auto",
          }}
          className="mt-[3px] before:absolute before:-top-4 before:left-2 before:h-12 before:w-8 before:cursor-pointer before:sm:-left-7 before:sm:top-2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative mx-auto flex"
          >
            <div
              className="absolute mb-[15px] ml-4 mt-[-5px] h-[12px] w-[12px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-4px] sm:mt-[14px]"
              data-testid={`${title ? `${title}-tooltip` : "tooltip"}`}
            ></div>
            <div className="flex flex-col rounded-2xl bg-white px-4 py-3 shadow-custom">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};
