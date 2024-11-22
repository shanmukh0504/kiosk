import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import Act2 from "/act2.png";

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
          title="act 2 testnet is now live!"
          description="Join the early access cohort to get in on the action!"
          image={Act2}
          link="https://garden.finance/blog/act-2-testnet-is-live"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
