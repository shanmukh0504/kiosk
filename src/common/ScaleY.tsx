import { motion } from "framer-motion";
import React from "react";

interface ScaleYInProps {
  children: React.ReactNode;
  triggerAnimation: boolean;
}

/**
 * ScaleYIn animation
 * @param triggerAnimation - true fires the animation
 * @param children - component to animate
 * @default triggerAnimation - true
 */
export const ScaleYIn = ({
  children,
  triggerAnimation = true,
}: ScaleYInProps) => {
  const animation = {
    hidden: { scaleY: 1, transformOrigin: "bottom" },
    animate: {
      scaleY: [0, 1],
      transformOrigin: "bottom",
      transition: { duration: 0.15, ease: "easeInOut", once: true },
    },
    exit: {
      scaleY: [1, 0],
      transformOrigin: "bottom",
      transition: { duration: 0.15, ease: "easeInOut", once: true },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={triggerAnimation ? "animate" : "hidden"}
      exit={"exit"}
      variants={animation}
    >
      {children}
    </motion.div>
  );
};
