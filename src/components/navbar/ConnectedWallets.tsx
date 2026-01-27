import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderStatus } from "@gardenfi/orderbook";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { ecosystems } from "./connectWallet/constants";
import { modalNames, modalStore } from "../../store/modalStore";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { deletedOrdersStore } from "../../store/deletedOrdersStore";
import { useSuiWallet } from "../../hooks/useSuiWallet";
import { useTronWallet } from "../../hooks/useTronWallet";
import { useXRPLWallet } from "../../hooks/useXRPLWallet";

const ConnectedWallets = () => {
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { account: ltcAddress } = useLitecoinWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { suiConnected, currentAccount } = useSuiWallet();
  const { tronConnected, wallet: tronAccount } = useTronWallet();
  const { xrplAddress } = useXRPLWallet();
  const { pendingOrders } = useGarden();
  const { setOpenModal } = modalStore();
  const { isOrderDeleted, cleanupDeletedOrders, deletedOrders } =
    deletedOrdersStore();
  const { pendingOrders: pendingOrdersFromStore, setPendingOrders } =
    pendingOrdersStore();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  const pendingOrdersCount = pendingOrdersFromStore.filter(
    (order) =>
      order.status !== OrderStatus.RedeemDetected &&
      order.status !== OrderStatus.Redeemed &&
      !deletedOrders.some((entry) => entry.orderId === order.order_id)
  ).length;

  useEffect(() => {
    if (pendingOrders.length > 0) {
      cleanupDeletedOrders(pendingOrders);
      const filteredOrders = pendingOrders.filter(
        (orders) =>
          !isOrderDeleted(orders.order_id) &&
          !(orders.status === OrderStatus.Expired)
      );
      setPendingOrders(filteredOrders);
    } else {
      setPendingOrders([]);
    }
  }, [cleanupDeletedOrders, isOrderDeleted, pendingOrders, setPendingOrders]);

  return (
    <>
      <Opacity
        level="medium"
        className="relative z-0 ml-auto flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-[24px] p-2 px-3 transition-all duration-300 hover:bg-opacity-80 sm:min-h-[40px] sm:min-w-[40px] sm:gap-2 sm:p-3"
        data-testid="navbar-wallets-button"
        onClick={handleAddressClick}
      >
        {!!pendingOrdersCount && (
          <div className="navbar-shine absolute left-0 top-0 -z-10 h-full w-full translate-x-[-25%] scale-150" />
        )}
        <WalletIcon
          className="h-4 w-4 sm:h-5 sm:w-5"
          data-testid="navbar-wallets-icon"
        />
        {address && (
          <img
            src={ecosystems.evm.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-evm-icon"
            alt="EVM wallet"
          />
        )}
        {btcAddress && (
          <img
            src={ecosystems.bitcoin.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-bitcoin-icon"
            alt="Bitcoin wallet"
          />
        )}
        {ltcAddress && (
          <img
            src={ecosystems.litecoin.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-litecoin-icon"
            alt="Litecoin wallet"
          />
        )}
        {starknetAddress && (
          <img
            src={ecosystems.starknet.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-starknet-icon"
            alt="Starknet wallet"
          />
        )}
        {solanaAddress && (
          <img
            src={ecosystems.solana.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-solana-icon"
            alt="Solana wallet"
          />
        )}
        {suiConnected && currentAccount && (
          <img
            src={ecosystems.sui.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-sui-icon"
            alt="Sui wallet"
          />
        )}
        {tronConnected && tronAccount && (
          <img
            src={ecosystems.tron.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            data-testid="navbar-wallet-tron-icon"
            alt="Tron wallet"
          />
        )}
        {xrplAddress && (
          <img
            src={ecosystems.xrpl.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="XRPL wallet"
          />
        )}
        {pendingOrdersCount ? (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full bg-rose p-2"
            data-testid="navbar-pending-orders-badge"
          >
            <Typography
              size="h5"
              weight="medium"
              className="h-4 !text-white"
              data-testid="navbar-pending-orders-count"
            >
              {pendingOrdersCount}
            </Typography>
          </div>
        ) : (
          <></>
        )}
      </Opacity>
    </>
  );
};

export default ConnectedWallets;
