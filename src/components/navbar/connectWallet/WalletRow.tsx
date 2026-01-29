import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Loader } from "../../../common/Loader";
import { ecosystems } from "./constants";
import { motion } from "framer-motion";
import { BlockchainType } from "@gardenfi/orderbook";
import { walletRowVariants } from "../../../animations/animations";

type WalletRowProps = {
  name: string;
  logo: string;
  onClick: () => void;
  isConnecting: boolean;
  isConnected: IsConnected;
  isAvailable: boolean;
  index: number;
};

type IsConnected = {
  [key in BlockchainType]: boolean;
};

export const WalletRow: FC<WalletRowProps> = ({
  name,
  logo,
  onClick,
  isConnecting,
  isConnected,
  isAvailable,
  index,
}) => {
  return (
    <motion.div
      layout
      variants={walletRowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        onClick={onClick}
        className={`flex h-full items-center justify-between gap-4 rounded-xl p-4 ${
          isAvailable
            ? "cursor-pointer hover:bg-off-white"
            : "pointer-events-none opacity-50"
        }`}
        data-testid={`connect-wallet-row-${name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt={"icon"}
            className="h-6 w-6 object-contain"
            style={{
              width: 24,
              height: 24,
              minWidth: 24,
              minHeight: 24,
              maxWidth: 24,
              maxHeight: 24,
            }}
          />
          <div className="flex items-center justify-between">
            <Typography
              size="h3"
              breakpoints={{
                sm: "h2",
              }}
              weight="regular"
            >
              {name === "Injected"
                ? "Browser Wallet"
                : name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnecting ? (
            <Loader />
          ) : Object.values(isConnected).some((value) => value) ? (
            <div
              className="flex w-fit items-center gap-2 rounded-full bg-white p-1 pl-3 pr-2"
              data-testid="wallet-connected"
            >
              <Typography size="h4" className="flex items-center gap-1">
                Connected
              </Typography>
              <div className="flex gap-1">
                {Object.entries(isConnected).map(
                  ([ecosystem, isConnected]) =>
                    isConnected && (
                      <img
                        key={ecosystem}
                        src={
                          ecosystems?.[ecosystem as keyof typeof ecosystems]
                            ?.icon ?? ""
                        }
                        alt={`${ecosystem} icon`}
                        className="rounded-full object-contain"
                        style={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    )
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};
