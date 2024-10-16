import { GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { modalNames, modalStore } from "../../store/modalStore";
import { useEVMWallet } from "../../hooks/useEVMWallet";

export const Navbar = () => {
  const { address } = useEVMWallet();
  const path = window.location.pathname;
  const isCurrentRoute = (route: string) => path === route;

  const { setOpenModal } = modalStore();

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    setOpenModal(modalNames.connectWallet);
  };
  const handleAddressClick = () => setOpenModal(modalNames.transactionsSideBar);

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
      <div className="ml-auto" onClick={handleAddressClick}>
        {address}
      </div>
      <div className="ml-auto" onClick={handleConnectClick}>
        Connect
      </div>
    </div>
  );
};
