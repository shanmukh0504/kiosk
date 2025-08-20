import { Variants } from "framer-motion";

export const expandAnimation: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};

export const fadeAnimation: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
};

export const delayedFadeAnimation: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

export const expandWithDelayAnimation: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.4,
      opacity: { delay: 0.23, ease: "easeOut" },
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      height: { delay: 0.23, ease: "easeOut" },
      ease: "easeOut",
    },
  },
};

export const detailsExpandAnimation: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: "12px",
    pointerEvents: "auto",
    transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
  },
};

export const addressExpandAnimation: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: "0",
    pointerEvents: "none" as const,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      height: { duration: 0.2, ease: "easeOut" },
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: "12px",
    pointerEvents: "auto" as const,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      height: { duration: 0.2, ease: "easeOut" },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: "0",
    pointerEvents: "none" as const,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      opacity: { duration: 0.2, ease: "easeOut" },
    },
  },
};

export const gardenPassContainerVariants: Variants = {
  initial: {
    width: 0,
  },
  animate: {
    width: 280,
  },
  exit: {
    width: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1,
      width: {
        delay: 0.1,
      },
    },
  },
};

export const gardenPassContentVariants: Variants = {
  initial: {
    opacity: 0,
    marginRight: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    marginRight: 16,
    transition: {
      scale: {
        delay: 0.2,
      },
      opacity: {
        delay: 0.12,
      },
    },
  },
  exit: {
    opacity: 0,
    marginRight: 0,
    scale: 0.95,
  },
};

export const springTransition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const stakePositionAnimation = (length: number) => ({
  initial: {
    opacity: 0,
    height: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      duration: Math.max(0.5, 0.02 * length),
      ease: "easeInOut",
      opacity: {
        duration: 0.2,
        delay: 0.2,
        ease: "easeInOut",
      },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      height: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeInOut",
      },
    },
  },
});
