import { Chip, Typography, Button } from "@gardenfi/garden-book";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, FC, useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import transactionHistoryStore from "../../store/transactionHistoryStore";
import { PendingTransactions } from "./PendingTransactions";
import { CompletedTransactions } from "./CompletedTransactions";
import { BlockchainType } from "@gardenfi/orderbook";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { starknetAddressToXOnly } from "../../utils/utils";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { useSuiWallet } from "../../hooks/useSuiWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";

type TransactionsProps = {
  isOpen: boolean;
};

export const Transactions: FC<TransactionsProps> = ({ isOpen }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending"
  );
  const [connectedWallets, setConnectedWallets] = useState<
    Record<BlockchainType, string>
  >({
    Bitcoin: "",
    EVM: "",
    Starknet: "",
    Solana: "",
    Sui: "",
  });

  const { garden } = useGarden();
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAddress } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { fetchTransactions, totalItems, transactions, loadMore } =
    transactionHistoryStore();

  const showLoadMore = useMemo(
    () => activeTab === "completed" && transactions.length < totalItems,
    [transactions.length, totalItems, activeTab]
  );
  const orderbookUrl = import.meta.env.VITE_ORDERBOOK_URL;

  const handleLoadMore = async () => {
    if (!garden) return;
    setIsLoadingMore(true);
    await loadMore(orderbookUrl, connectedWallets).finally(() => {
      setIsLoadingMore(false);
    });
  };

  useEffect(() => {
    if (!garden || !isOpen) return;
    if (garden) {
      setConnectedWallets({
        Bitcoin: btcAddress ?? "",
        EVM: address ?? "",
        Starknet: starknetAddressToXOnly(starknetAddress ?? ""),
        Solana: solanaAddress ?? "",
        Sui: currentAccount?.address ?? "",
      });
      fetchTransactions(orderbookUrl, {
        Bitcoin: btcAddress ?? "",
        EVM: address ?? "",
        Starknet: starknetAddressToXOnly(starknetAddress ?? ""),
        Solana: solanaAddress ?? "",
        Sui: currentAccount?.address ?? "",
      });
    }
  }, [
    garden,
    address,
    starknetAddress,
    fetchTransactions,
    isOpen,
    solanaAddress,
    currentAccount,
    btcAddress,
  ]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Chip
          className={`cursor-pointer px-2 py-1 ${activeTab === "pending" ? "!bg-white/50" : "border !border-white/50 !bg-white/25"}`}
          onClick={() => setActiveTab("pending")}
        >
          <Typography size="h4">Pending</Typography>
        </Chip>
        <Chip
          className={`cursor-pointer px-2 py-1 ${activeTab === "completed" ? "!bg-white/50" : "border !border-white/50 !bg-white/25"}`}
          onClick={() => setActiveTab("completed")}
        >
          <Typography size="h4">Completed</Typography>
        </Chip>
      </div>
      <div
        className={`scrollbar-hide flex max-h-[50vh] flex-col gap-5 overflow-y-auto rounded-2xl pb-6 sm:h-full sm:max-h-[calc(100vh-180px)]`}
      >
        <div className="flex flex-col rounded-2xl bg-white/50">
          <Typography size="h5" weight="medium" className="p-4">
            Transactions
          </Typography>
          {activeTab === "pending" ? (
            <PendingTransactions />
          ) : (
            <CompletedTransactions />
          )}
        </div>
        {showLoadMore && (
          <Button
            onClick={handleLoadMore}
            variant={isLoadingMore ? "disabled" : "secondary"}
            className="mx-auto min-h-10 w-1/4"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
};
