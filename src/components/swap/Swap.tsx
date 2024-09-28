import { Button } from "@gardenfi/garden-book";
import { useState } from "react";
import { useConnect } from "wagmi";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const handleChange = (
    input: string,
    maxDecimals: number,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const parts = input.split(".");
    // Check if the last character is a digit or a dot.
    if (
      // If it's a digit
      /^[0-9]$/.test(input.at(-1)!) ||
      // or it's a dot and there is only one dot in the entire string
      (input.at(-1) === "." && parts.length - 1 === 1)
    ) {
      const decimals = (parts[1] || "").length;
      // If there are more than the maximum decimals after the point.
      if (decimals > maxDecimals && parts[1]) {
        // Trim decimals to only keep the maximum amount..
        setInput(parts[0] + "." + parts[1].slice(0, maxDecimals));
      } else {
        // Otherwise, just set the input.
        setInput(input);
      }
      return;
    }
    // If it's an empty string, just set the input.
    else if (input.length === 0) {
      setInput(input);
    }
    // If the last character is not a numerical digit or a dot, and the string
    // is not empty, do nothing and return.
    else {
      return;
    }
  };

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
      <div className="bg-white/50 rounded-[20px] w-full max-w-[424px] mx-auto p-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <span className="font-semibold text-xs">Send</span>
                <span className="text-xs">~224.51 USD</span>
              </div>
              <span className="text-xs">~2m 30s</span>
            </div>
            <div className="flex justify-between">
              <input
                className="text-xl flex-grow outline-none"
                type="text"
                value={sendAmount}
                placeholder="0.0"
                onChange={(e) => handleChange(e.target.value, 8, setSendAmount)}
              />
              <span className="font-medium text-xl">BTC</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <span className="font-semibold text-xs">Receive</span>
                <span className="text-xs">~224.51 USD</span>
              </div>
              <span className="text-xs">~2m 30s</span>
            </div>
            <div className="flex justify-between">
              <input
                className="text-xl flex-grow outline-none"
                type="text"
                value={receiveAmount}
                placeholder="0.0"
                onChange={(e) =>
                  handleChange(e.target.value, 8, setReceiveAmount)
                }
              />
              <span className="font-medium text-xl">BTC</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <span className="font-semibold text-xs">Refund address</span>
            <input
              className="text-base flex-grow outline-none"
              type="text"
              placeholder="Your Bitcoin address"
            />
          </div>
          <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
            <span className="font-semibold text-xs">Fees</span>
            <span className="font-semibold text-base">0.0003256 SEED</span>
          </div>
          <Button size="lg">Swap</Button>
        </div>
      </div>
    </div>
  );
};
