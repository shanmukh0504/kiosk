import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";

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
        <Notification
          title="Season 3 ended! Collect your reward on 15th June!"
          description="Deposit WBTC into Radiant and borrow & loop USDC to leverage."
          image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png"
          link="https://garden.finance"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
