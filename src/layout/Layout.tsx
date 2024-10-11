import { Footer, Opacity } from "@gardenfi/garden-book";
import { FC } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Notification } from "../common/Notification";
import { ConnectWallet } from "../components/navbar/ConnectWalletModal";
import { modalNames, modalStore } from "../store/modalStore";

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { modalName, setCloseModal } = modalStore(); // TODO: Why do we need a store for this?
  const theme = getCurrentTheme();
  return (
    <Opacity
      level={"medium"}
      className={`${theme} z-10 relative bg-primary overflow-hidden`}
    >
      <ConnectWallet
        open={modalName.connectWallet}
        onClose={() => setCloseModal(modalNames.connectWallet)}
      />
      <Navbar />
      <div className="min-h-[100vh]">{children}</div>
      {theme === "swap" &&
        <Notification
          title="Season 3 ended! Collect your reward on 15th June!"
          description="Deposit WBTC into Radiant and borrow & loop USDC to leverage lorem ipsum dolor sit amet."
          image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png"
          link="https://garden.finance"
        />
      }
      <Footer className={"mt-auto"} />
      <Orb />
    </Opacity>
  );
};
