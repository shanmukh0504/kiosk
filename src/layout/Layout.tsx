import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
// @ts-expect-error - Package exports types but they cannot be resolved due to package.json exports configuration
import { SnowOverlay } from "react-snow-overlay";

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const theme = getCurrentTheme();

  return (
    <div className={`${theme} relative overflow-hidden bg-opacity-50`}>
      <div className="absolute inset-0 z-[-30] bg-primary"></div>
      <Orb />
      <div className="relative z-10 bg-white bg-opacity-50">
        <Modal />
        <div className="min-h-[100vh]">
          <Navbar />
          {children}
        </div>
        <SnowOverlay maxParticles={300} />
        <Notification
          id="introducing-act-2"
          title="introducing act 2: bloom"
          description="Join the early access cohort to get in on the action!"
          image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/10/act2_bloom.png"
          link="https://garden.finance/blog/act-2-bloom"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
