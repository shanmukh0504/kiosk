import { useEffect } from "react";
import { Swap } from "../components/swap/Swap";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export const SwapPage = () => {
  const { context, isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    setFrameReady();
    if (isFrameReady && context) {
      console.log("context", context);
    }
  }, [context, isFrameReady]);
  const isTrueMini = Boolean(context?.features?.haptics);

  // console.log(context?.features);
  return (
    <div className="h-full w-full">
      <Swap />
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">
          {isFrameReady ? "Frame is ready" : "Loading..."}
          {context && (
            <span className="ml-2 text-blue-500">
              Address: {context.client.added}
              <br />
              Features: {context.client.clientFid}
            </span>
          )}
        </p>
        <button
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => {
            setFrameReady();
            console.log("Frame set to ready");
          }}
        >
          Set Frame Ready
        </button>
        <p>
          {isFrameReady
            ? isTrueMini
              ? "Running inside Coinbase Wallet Mini App"
              : "Running in plain browser"
            : "Loading..."}
        </p>
      </div>
    </div>
  );
};
