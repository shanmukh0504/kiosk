import { cubicBezier, motion } from "framer-motion";
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
export const ScaleYIn = ({ children, triggerAnimation }: ScaleYInProps) => {
  const animation = {
    exit: {
      scaleY: [1, 0],
      opacity: [1, 0],
      transition: {
        duration: 0.2,
        ease: cubicBezier(0.84, 0.0, 0.16, 1.0),
        opacity: { duration: 0.2, ease: "easeInOut" },
        once: true,
      },
    },
    animate: {
      scaleY: [0, 1],
      opacity: [0, 1],
      transition: {
        duration: 0.5,
        ease: cubicBezier(0.84, 0.0, 0.16, 1.0),
        opacity: { duration: 0.5, ease: "easeInOut" },
        once: true,
      },
    },
  };

  return (
    <motion.div
      animate={triggerAnimation ? "animate" : ""}
      exit={"exit"}
      variants={animation}
      style={{ transformOrigin: "bottom" }}
    >
      {children}
    </motion.div>
  );
};
