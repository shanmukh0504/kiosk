import {
  Button,
  CodeBlockIcon,
  GardenFullLogo,
  GardenIcon,
  Typography,
} from "@gardenfi/garden-book";
import { isTestnet, routes } from "../../constants/constants";
import { API } from "../../constants/api";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { isCurrentRoute } from "../../utils/utils";
import { MobileMenu } from "./MobileMenu";
import { modalNames, modalStore } from "../../store/modalStore";
import ConnectedWallets from "./ConnectedWallets";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { viewPortStore } from "../../store/viewPortStore";
import { useSuiWallet } from "../../hooks/useSuiWallet";
import { useTronWallet } from "../../hooks/useTronWallet";
import { useXRPLWallet } from "../../hooks/useXRPLWallet";

export const Navbar = () => {
  const { isConnected, address } = useEVMWallet();
  const { account: ltcAddress } = useLitecoinWallet();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { suiConnected } = useSuiWallet();
  const { tronConnected } = useTronWallet();
  const { xrplAddress } = useXRPLWallet();
  const { setOpenModal } = modalStore();
  const { isMobile } = viewPortStore();

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    if (isConnected) return;
    setOpenModal(modalNames.connectWallet);
  };

  return (
    <div
      className={
        "flex items-center justify-between gap-2 px-4 py-4 text-dark-grey sm:gap-3 sm:px-6 sm:py-6 lg:px-10"
      }
    >
      <div className="flex items-center gap-4 sm:gap-8 lg:gap-16">
        <GardenFullLogo
          onClick={handleHomeLogoClick}
          className="hidden cursor-pointer sm:block"
        />
        <GardenIcon
          onClick={handleHomeLogoClick}
          className="h-7 w-7 cursor-pointer sm:hidden sm:h-8 sm:w-8"
        />
        <div className="hidden gap-8 md:flex md:items-center md:gap-12">
          {routes.map(([, route]) => {
            const paths = route.path;
            const isActive = paths.some(isCurrentRoute);
            const primaryPath = paths[0];
            return (
              <a
                key={primaryPath}
                href={primaryPath}
                target={route.isExternal ? "_blank" : undefined}
                rel={route.isExternal ? "noreferrer" : undefined}
              >
                <Typography size="h2" weight={isActive ? "medium" : "regular"}>
                  {route.name}
                </Typography>
              </a>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {!isMobile && isTestnet && (
          <div className="hidden items-center gap-2 rounded-3xl bg-white/25 px-3 py-2 sm:flex sm:px-4 sm:py-3">
            <CodeBlockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <Typography
              size="h3"
              weight="regular"
              className="text-sm sm:text-base"
            >
              Testnet
            </Typography>
          </div>
        )}
        {address ||
        starknetAddress ||
        btcAddress ||
        ltcAddress ||
        solanaAddress ||
        suiConnected ||
        tronConnected ||
        xrplAddress ? (
          <ConnectedWallets />
        ) : (
          <Button
            variant="primary"
            onClick={handleConnectClick}
            className="!rounded-3xl !px-4 !py-2 text-sm sm:!px-6 sm:!py-3 sm:text-base"
            size="sm"
            breakpoints={{ sm: "lg" }}
          >
            Connect
          </Button>
        )}
        <MobileMenu />
      </div>
    </div>
  );
};
