import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Loader } from "../../../common/Loader";
import { EcosystemKeys, ecosystems } from "./constants";
import { motion } from "framer-motion";

type WalletRowProps = {
  name: string;
  logo: string;
  onClick: () => void;
  isConnecting: boolean;
  isConnected: IsConnected;
  isAvailable: boolean;
};

type IsConnected = {
  [key in EcosystemKeys]: boolean;
};

export const WalletRow: FC<WalletRowProps> = ({
  name,
  logo,
  onClick,
  isConnecting,
  isConnected,
  isAvailable,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, marginBottom: -60 }}
      animate={{ opacity: 1, marginBottom: 0 }}
      exit={{ opacity: 0, marginBottom: -60 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      <div
        onClick={onClick}
        className={`flex h-full items-center justify-between gap-4 rounded-xl p-4 ${
          isAvailable
            ? "cursor-pointer hover:bg-off-white"
            : "pointer-events-none opacity-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <img src={logo} alt={"icon"} className="h-6 w-6" />
          <div className="flex items-center justify-between">
            <Typography
              size="h3"
              breakpoints={{
                sm: "h2",
              }}
              weight="medium"
            >
              {name === "Injected"
                ? "Browser Wallet"
                : name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnecting && <Loader />}
          {Object.values(isConnected).some((value) => value) && (
            <div className="flex w-fit items-center gap-2 rounded-full bg-white p-1 pl-3 pr-2">
              <Typography size="h4" className="flex items-center gap-1">
                Connected
              </Typography>
              <div className="flex gap-1">
                {Object.entries(isConnected).map(
                  ([ecosystem, isConnected]) =>
                    isConnected && (
                      <img
                        key={ecosystem}
                        src={ecosystems[ecosystem as EcosystemKeys].icon ?? ""}
                        height={24}
                        width={24}
                      />
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
