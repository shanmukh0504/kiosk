import {
  Button,
  CodeBlockIcon,
  GardenFullLogo,
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
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { viewPortStore } from "../../store/viewPortStore";

export const Navbar = () => {
  const { isConnected, address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { setOpenModal } = modalStore();
  const { isMobile } = viewPortStore();

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    if (isConnected) return;
    setOpenModal(modalNames.connectWallet);
  };

  return (
    <div
      className={"flex items-center justify-between gap-3 px-6 py-6 sm:px-10"}
    >
      <div className="flex items-center gap-16 py-2">
        <GardenFullLogo
          onClick={handleHomeLogoClick}
          className="cursor-pointer"
        />
        <div className="hidden gap-12 sm:flex sm:items-center">
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
                <Typography size="h2" weight={isActive ? "bold" : "medium"}>
                  {route.name}
                </Typography>
              </a>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isMobile && isTestnet && (
          <div className="flex items-center gap-2 rounded-3xl bg-white/25 px-4 py-3">
            <CodeBlockIcon />
            <Typography size="h3" weight="medium">
              Testnet
            </Typography>
          </div>
        )}
        {address || starknetAddress || btcAddress || solanaAddress ? (
          <ConnectedWallets />
        ) : (
          <Button
            variant="primary"
            onClick={handleConnectClick}
            className="!h-12 min-w-28 !rounded-3xl"
            size="lg"
          >
            Connect
          </Button>
        )}
        <MobileMenu />
      </div>
    </div>
  );
};
