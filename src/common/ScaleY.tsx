import { motion } from "framer-motion";
import React from "react";

interface ScaleYInProps {
    children: React.ReactNode;
    triggerAnimation: boolean;
}

/**
 * ScaleY animation
 * @param triggerAnimation - true fires the animation
 * @param children - component to animate
 * @default triggerAnimation - true
 */
export const ScaleYIn = ({ children, triggerAnimation = true }: ScaleYInProps) => {
    const animation = {
        hidden: { scaleY: 1, transformOrigin: "bottom", },
        animate: { scaleY: [0, 1], transformOrigin: "bottom", transition: { duration: .15, ease: "easeInOut", once: true, } },
    }

    // const controls = useAnimationControls();

    // useEffect(() => {
    //     if (triggerAnimation) {
    //         controls.start({
    //             scaleY: [0, 1],
    //             transformOrigin: "bottom",
    //             transition: { duration: 0.15 },
    //         });
    //     } else {
    //         controls.start({
    //             scaleY: 1,
    //             transformOrigin: "bottom",
    //             transition: { duration: 0.15 },
    //         });
    //     }
    // }, [triggerAnimation, controls]);

    return (
        <motion.div initial="hidden" animate={triggerAnimation ? 'animate' : 'hidden'} variants={animation}>
            {children}
        </motion.div>
    );
};
