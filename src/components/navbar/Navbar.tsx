import { Button, GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Address } from "./Address";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderStatus } from "@gardenfi/core";
import { isCurrentRoute } from "../../utils/utils";
import { MobileMenu } from "./MobileMenu";
import { connectWalletStore } from "../../store/connectWalletStore";

export const Navbar = () => {
  const [isInitiatingSM, setIsInitiatingSM] = useState(false);
  const [shouldInitiateSM, setShouldInitiateSM] = useState(false);

  const { isConnected } = useEVMWallet();
  const { setIsOpen } = connectWalletStore();
  const { pendingOrders, isExecuting, initializeSecretManager, secretManager } =
    useGarden();

  const isFullyConnected = useMemo(
    () => isConnected && !shouldInitiateSM,
    [isConnected, shouldInitiateSM]
  );

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    if (isFullyConnected) return;
    if (isConnected && shouldInitiateSM) handleInitializeSM();
    else setIsOpen();
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
      const status = order.status;
      return (
        status === OrderStatus.InitiateDetected ||
        status === OrderStatus.Initiated ||
        status === OrderStatus.CounterPartyInitiateDetected ||
        status === OrderStatus.CounterPartyInitiated ||
        status === OrderStatus.RedeemDetected ||
        status === OrderStatus.Expired
      );
    });

    if (isSMRequired) handleInitializeSM();
  }, [
    pendingOrders,
    isExecuting,
    handleInitializeSM,
    isInitiatingSM,
    shouldInitiateSM,
  ]);

  return (
    <div
      className={"flex items-center justify-between px-6 sm:px-10 py-6 gap-3"}
    >
      <div className="flex items-center gap-16">
        <GardenFullLogo
          onClick={handleHomeLogoClick}
          className="cursor-pointer "
        />
        <div className="hidden sm:flex  sm:items-center gap-12">
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
      </div>
      {isFullyConnected ? (
        <Address />
      ) : (
        <Button
          variant="primary"
          onClick={handleConnectClick}
          className="ml-auto w-28"
          size="sm"
        >
          Connect
        </Button>
      )}
      <MobileMenu />
    </div>
  );
};
