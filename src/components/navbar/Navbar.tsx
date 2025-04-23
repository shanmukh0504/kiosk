import { Button, GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { useEVMWallet } from "../../hooks/useEVMWallet";
// import { Address } from "./Address";
import { isCurrentRoute } from "../../utils/utils";
import { MobileMenu } from "./MobileMenu";
import { modalNames, modalStore } from "../../store/modalStore";
import ConnectedWallets from "./ConnectedWallets";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";

export const Navbar = () => {
  const { isConnected, address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { setOpenModal } = modalStore();

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
          {Object.values(INTERNAL_ROUTES).map((route) => {
            const paths = route.path;
            const isActive = paths.some(isCurrentRoute);
            const primaryPath = paths[0];
            return (
              <a key={primaryPath} href={primaryPath}>
                <Typography size="h2" weight={isActive ? "bold" : "medium"}>
                  {route.name}
                </Typography>
              </a>
            );
          })}
        </div>
      </div>
      {address || starknetAddress || btcAddress ? (
        <ConnectedWallets />
      ) : (
        <Button
          variant="primary"
          onClick={handleConnectClick}
          className="ml-auto min-w-28"
          size="sm"
          breakpoints={{ md: "md" }}
        >
          Connect
        </Button>
      )}
      <MobileMenu />
    </div>
  );
};
