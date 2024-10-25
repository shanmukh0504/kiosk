import {
  ArrowLeftIcon,
  Button,
  CheckIcon,
  CopyIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useEffect, useState } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { swapStore } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { useGarden } from "@gardenfi/react-hooks";

export const BTCInit = () => {
  const [copied, setCopied] = useState(false);
  const [isInitiatedDetected, setIsInitiatedDetected] = useState(false);
  const {
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
    btcAddress,
    btcInitModal,
    closeBTCInitModal,
  } = swapStore();
  const isRecoveryAddress = inputAsset && isBitcoin(inputAsset?.chain);
  const depositAddress = btcInitModal.order
    ? btcInitModal.order.source_swap.swap_id
    : "";
  const { orderBook } = useGarden();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositAddress);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const goBack = () => closeBTCInitModal();

  useEffect(() => {
    if (!btcInitModal.order || !orderBook) return;

    const fetchOrder = async () => {
      if (!btcInitModal.order) return;
      const order = await orderBook.getOrder(
        btcInitModal.order.create_order.create_id,
        true,
      );
      if (order.error) return;
      //initiate detected
      if (order.val.source_swap.initiate_tx_hash) {
        //initiated
        if (Number(order.val.source_swap.initiate_block_number)) goBack();
        setIsInitiatedDetected(true);
      }
    };

    void fetchOrder();
    const intervalId = setInterval(fetchOrder, 5000);

    return () => clearInterval(intervalId);
  }, [btcInitModal.order, orderBook]);

  return btcInitModal.order ? (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Transaction
        </Typography>
        {inputAsset && outputAsset && (
          <SwapInfo
            sendAsset={inputAsset}
            receiveAsset={outputAsset}
            sendAmount={inputAmount}
            receiveAmount={outputAmount}
          />
        )}
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Deposit address
        </Typography>
        <div className="flex justify-between items-center">
          <Typography size="h3" weight="bold">
            {getTrimmedAddress(depositAddress)}
          </Typography>
          {/* TODO: Use a Lottie animation to make this smoother */}
          {copied ? (
            <CheckIcon className="w-6 h-3" />
          ) : (
            <CopyIcon
              className="w-6 h-5 cursor-pointer"
              onClick={copyToClipboard}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Transaction details
        </Typography>
        <div className="flex justify-between">
          <Typography size="h4" weight="medium">
            Fees
          </Typography>
          <div className="flex gap-5">
            <Typography size="h4" weight="medium">
              0.00101204 BTC
            </Typography>
            <Typography size="h4" weight="medium">
              $56.56
            </Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <Typography size="h4" weight="medium">
            {isRecoveryAddress ? "Recovery" : "Receive"} address
          </Typography>
          <Typography size="h4" weight="medium">
            {getTrimmedAddress(btcAddress)}
          </Typography>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="disabled" size="lg" className="w-full">
          Awaiting {isInitiatedDetected ? "Confirmation" : "Deposit"}
        </Button>
        <div
          className="flex items-center bg-dark-grey rounded-2xl p-3 cursor-pointer"
          onClick={goBack}
        >
          <ArrowLeftIcon className="w-6 h-[14px] fill-white" />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
