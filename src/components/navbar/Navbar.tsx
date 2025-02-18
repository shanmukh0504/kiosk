import { Button, GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { API } from "../../constants/api";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Address } from "./Address";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { isCurrentRoute } from "../../utils/utils";
import { MobileMenu } from "./MobileMenu";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { modalNames, modalStore } from "../../store/modalStore";

export const Navbar = () => {
  const [isInitiatingSM, setIsInitiatingSM] = useState(false);

  const { isConnected, address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { account } = useBitcoinWallet();
  const { garden, isExecuting, isExecutorRequired } = useGarden();

  const shouldInitiateSM = useMemo(
    () => isExecutorRequired && !isExecuting,
    [isExecuting, isExecutorRequired]
  );

  const isEVMConnect = !address && !!account;

  const isFullyConnected = useMemo(
    () => isConnected && !shouldInitiateSM,
    [isConnected, shouldInitiateSM]
  );

  const handleHomeLogoClick = () => window.open(API().home, "_blank");
  const handleConnectClick = () => {
    if (isFullyConnected) return;
    if (isConnected && shouldInitiateSM) handleInitializeSM();
    else setOpenModal(modalNames.connectWallet);
  };

  const handleInitializeSM = useCallback(async () => {
    if (!garden) return;
    setIsInitiatingSM(true);
    const res = await garden.secretManager.initialize();
    if (res.error) {
      // if (res.error.includes("User rejected the request"))
      //   setShouldInitiateSM(true);
      setIsInitiatingSM(false);
      return;
    }
    setIsInitiatingSM(false);
  }, [garden]);

  useEffect(() => {
    if (isInitiatingSM || !garden) return;
    if (shouldInitiateSM) handleInitializeSM();
  }, [isInitiatingSM, garden, shouldInitiateSM, handleInitializeSM]);

  return (
    <div
      className={"flex items-center justify-between gap-3 px-6 py-6 sm:px-10"}
    >
      <div className="flex items-center gap-16">
        <GardenFullLogo
          onClick={handleHomeLogoClick}
          className="cursor-pointer"
        />
        <div className="hidden gap-12 sm:flex sm:items-center">
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
          className="ml-auto min-w-28"
          size="sm"
          breakpoints={{ md: "md" }}
          loading={isInitiatingSM}
        >
          {isEVMConnect ? "Connect EVM" : "Connect"}
        </Button>
      )}
      <MobileMenu />
    </div>
  );
};
