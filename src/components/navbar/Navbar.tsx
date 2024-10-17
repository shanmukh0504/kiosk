import { Button, GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { modalNames, modalStore } from "../../store/modalStore";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Address } from "./Address";

export const Navbar = () => {
  const { isConnected } = useEVMWallet();
  const { setOpenModal } = modalStore();

  const path = window.location.pathname;
  const isCurrentRoute = (route: string) => path === route;

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => setOpenModal(modalNames.connectWallet);

  return (
    <div className={"flex items-center px-10 py-6 gap-16"}>
      <GardenFullLogo
        onClick={handleHomeLogoClick}
        className="cursor-pointer"
      />
      <div className="flex gap-12">
        {Object.values(INTERNAL_ROUTES).map((route) => {
          return (
            <a key={route.path} href={route.path}>
              <Typography
                size="h2"
                weight={isCurrentRoute(route.path) ? "bold" : "medium"}
              >
                {route.name}
              </Typography>
            </a>
          );
        })}
      </div>
      {isConnected ? (
        <Address />
      ) : (
        <Button
          variant="primary"
          onClick={handleConnectClick}
          className="ml-auto w-28 bg-red-900"
        >
          Connect
        </Button>
      )}
    </div>
  );
};
