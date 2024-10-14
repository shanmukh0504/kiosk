import { Footer } from "@gardenfi/garden-book";
import { FC } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const theme = getCurrentTheme();
  return (
    <div
      className={`${theme} z-10 relative bg-primary bg-opacity-50 overflow-hidden`}
    >
      <Modal />
      <Navbar />
      <div className="min-h-[100vh]">{children}</div>
      <Notification
        title="Season 3 ended! Collect your reward on 15th June!"
        description="Deposit WBTC into Radiant and borrow & loop USDC to leverage lorem ipsum dolor sit amet."
        image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png"
        link="https://garden.finance"
      />
      <Footer className={"mt-auto"} />
      <Orb />
    </div>
  );
};
