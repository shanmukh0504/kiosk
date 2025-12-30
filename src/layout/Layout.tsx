import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect, useCallback } from "react";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";
import { network, THEMES } from "../constants/constants";
import { viewPortStore } from "../store/viewPortStore";
import { notificationStore } from "../store/notificationStore";
import { balanceStore } from "../store/balanceStore";
import { ChainType } from "../utils/balanceSSEService";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../hooks/useEVMWallet";
import { useStarknetWallet } from "../hooks/useStarknetWallet";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { useSuiWallet } from "../hooks/useSuiWallet";
import { useTronWallet } from "../hooks/useTronWallet";

type LayoutProps = {
  children: ReactNode;
};

const LayoutContent: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains, assets, fetchAndSetFiatValues } =
    assetInfoStore();
  const { isMobile } = viewPortStore();
  const theme = getCurrentTheme();
  const { fetchNotification } = notificationStore();
  const { connectBalanceStream, disconnectBalanceStream } = balanceStore();

  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();
  const { tronAddress } = useTronWallet();

  const setupBalanceStreams = useCallback(() => {
    [
      address && connectBalanceStream(ChainType.EVM, address),
      btcAddress && connectBalanceStream(ChainType.BITCOIN, btcAddress),
      starknetAddress &&
        connectBalanceStream(ChainType.STARKNET, starknetAddress),
      solanaAnchorProvider &&
        connectBalanceStream(
          ChainType.SOLANA,
          solanaAnchorProvider.publicKey.toString()
        ),
      currentAccount &&
        connectBalanceStream(ChainType.SUI, currentAccount.address),
      tronAddress && connectBalanceStream(ChainType.TRON, tronAddress),
    ].filter(Boolean);
  }, [
    address,
    btcAddress,
    currentAccount,
    starknetAddress,
    solanaAnchorProvider,
    tronAddress,
    connectBalanceStream,
  ]);

  useEffect(() => {
    fetchAndSetAssetsAndChains();
    fetchNotification();
  }, [fetchAndSetAssetsAndChains, fetchNotification]);

  useEffect(() => {
    if (!assets) return;

    fetchAndSetFiatValues();
    setupBalanceStreams();

    return () => {
      [
        address && disconnectBalanceStream(ChainType.EVM, address),
        btcAddress && disconnectBalanceStream(ChainType.BITCOIN, btcAddress),
        starknetAddress &&
          disconnectBalanceStream(ChainType.STARKNET, starknetAddress),
        solanaAnchorProvider &&
          disconnectBalanceStream(
            ChainType.SOLANA,
            solanaAnchorProvider.publicKey.toString()
          ),
        currentAccount &&
          disconnectBalanceStream(ChainType.SUI, currentAccount.address),
        tronAddress && disconnectBalanceStream(ChainType.TRON, tronAddress),
      ].filter(Boolean);
    };
  }, [
    assets,
    address,
    btcAddress,
    starknetAddress,
    solanaAnchorProvider,
    currentAccount,
    tronAddress,
    setupBalanceStreams,
    disconnectBalanceStream,
    fetchAndSetFiatValues,
  ]);

  return (
    <div className={`${theme} overflow-hidden overscroll-none text-dark-grey`}>
      <ViewPortListener />
      <div className="relative z-10 bg-primary">
        <div
          className="fixed bottom-0 -z-10 h-full max-h-[612px] w-screen origin-bottom overflow-hidden opacity-60"
          style={{
            background:
              theme === THEMES.swap
                ? "linear-gradient(180deg, rgba(188, 237, 220, 0) 0%, #BCEDDC 100%)"
                : "linear-gradient(180deg, rgba(255, 189, 205, 0) 0%, #FFBDCD 100%)",
          }}
        />
        <Modal />
        <Navbar />
        {children}
        {!isMobile && <Notification />}
        <Footer
          className={"mt-auto"}
          maskUrl="https://garden.imgix.net/footer/maskRect.svg"
          network={network}
        />
      </div>
    </div>
  );
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  return <LayoutContent>{children}</LayoutContent>;
};
