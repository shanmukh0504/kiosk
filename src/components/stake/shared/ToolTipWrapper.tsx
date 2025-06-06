import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Portal } from "../../Portal";

// Accept targetRef as a prop
interface TooltipWrapperProps {
  children: ReactNode;
  targetRef: React.RefObject<HTMLElement>;
}

export const TooltipWrapper: FC<TooltipWrapperProps> = ({
  children,
  targetRef,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!targetRef?.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPosition({
        top: rect.top - 16,
        left: rect.right + 10,
      });
    };

    const handleScroll = () => {
      setIsVisible(false);
    };

    // Initial position update
    updatePosition();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, true);

    // Add resize observer to track target position changes
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    if (targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
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
          className="before:absolute before:-left-7 before:top-2 before:h-12 before:w-8 before:cursor-pointer"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};
