import { motion } from "framer-motion";

type HamburgerIconProps = {
  isSidebarOpen: boolean;
};

export const HamburgerIcon = ({ isSidebarOpen }: HamburgerIconProps) => {
  return (
    <div className="flex h-8 w-8 cursor-pointer flex-col justify-center gap-[3px] rounded-full p-2">
      <motion.div
        animate={
          isSidebarOpen
            ? {
                y: 5,
                rotate: 45,
              }
            : {
                y: 0,
                rotate: 0,
              }
        }
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          y: { delay: isSidebarOpen ? 0.1 : 0.2 },
          rotate: { delay: isSidebarOpen ? 0.2 : 0.1 },
        }}
        className="block h-[1.8px] min-h-[1.8px] w-full origin-center rounded-full bg-dark-grey"
      />
      <motion.div
        animate={
          isSidebarOpen
            ? {
                width: 0,
                x: 8,
              }
            : {
                width: "100%",
                x: 0,
              }
        }
        transition={{
          duration: 0.2,
          ease: "easeInOut",
          delay: isSidebarOpen ? 0 : 0.4,
        }}
        className="block h-[1.8px] min-h-[1.8px] origin-center overflow-hidden rounded-full bg-dark-grey"
      />
      <motion.div
        animate={
          isSidebarOpen
            ? {
                y: -5,
                rotate: -45,
              }
            : {
                y: 0,
                rotate: 0,
              }
        }
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          y: { delay: isSidebarOpen ? 0.1 : 0.2 },
          rotate: { delay: isSidebarOpen ? 0.2 : 0.1 },
        }}
        className="block h-[1.8px] min-h-[1.8px] w-full origin-center overflow-hidden rounded-full bg-dark-grey"
      />
    </div>
  );
};
