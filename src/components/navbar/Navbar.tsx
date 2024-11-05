import { Button, GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { modalNames, modalStore } from "../../store/modalStore";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Address } from "./Address";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderActions, parseActionFromStatus } from "@gardenfi/core";

export const Navbar = () => {
  const [isInitiatingSM, setIsInitiatingSM] = useState(false);
  const [shouldInitiateSM, setShouldInitiateSM] = useState(false);

  const { isConnected } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { pendingOrders, isExecuting, initializeSecretManager, secretManager } =
    useGarden();

  const isFullyConnected = useMemo(
    () => isConnected && !shouldInitiateSM,
    [isConnected, shouldInitiateSM]
  );

  const isCurrentRoute = (route: string) => window.location.pathname === route;

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    if (isFullyConnected) return;
    if (isConnected && shouldInitiateSM) handleInitializeSM();
    else setOpenModal(modalNames.connectWallet);
  };

  const handleInitializeSM = useCallback(async () => {
    if (!initializeSecretManager || secretManager) return;
    setIsInitiatingSM(true);
    const res = await initializeSecretManager();
    if (res.error) {
      if (res.error.includes("User rejected the request"))
        setShouldInitiateSM(true);
      setIsInitiatingSM(false);
      return;
    }
    setShouldInitiateSM(false);
    setIsInitiatingSM(false);
  }, [initializeSecretManager, secretManager]);

  useEffect(() => {
    if (
      !pendingOrders ||
      !pendingOrders.length ||
      isExecuting ||
      isInitiatingSM ||
      shouldInitiateSM
    )
      return;
    const isSMRequired = !!pendingOrders.find((order) => {
      const action = parseActionFromStatus(order.status);
      return action === OrderActions.Redeem || action === OrderActions.Refund;
    });

    if (isSMRequired) handleInitializeSM();
  }, [
    pendingOrders,
    isExecuting,
    setOpenModal,
    handleInitializeSM,
    isInitiatingSM,
    shouldInitiateSM,
  ]);

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
      {isFullyConnected ? (
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
