import {
  ArrowLeftIcon,
  BTCLogo,
  Button,
  Chip,
  KeyboardDownIcon,
  RadioCheckedIcon,
  TimerIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState } from "react";
import { useConnect } from "wagmi";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showAssetSelector, setShowAssetSelector] = useState(false);

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
      <div className="relative bg-white/50 rounded-[20px] w-full max-w-[424px] mx-auto p-3">
        <div
          className={`flex flex-col gap-3 absolute top-0 ${showAssetSelector ? "left-0" : "left-full"} z-10 h-full w-full p-3 transition-all`}
        >
          <div className="flex justify-between items-center p-1">
            <Typography size="h4" weight="bold">
              Token select
            </Typography>
            <ArrowLeftIcon
              className="cursor-pointer"
              onClick={() => setShowAssetSelector(false)}
            />
          </div>
          <div className="flex gap-3">
            <Chip className="pl-3 pr-2 py-1 cursor-pointer">
              <Typography size="h3" weight="medium">
                Bitcoin
              </Typography>
              <RadioCheckedIcon />
            </Chip>
            <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
              <Typography size="h3" weight="medium">
                Ethereum
              </Typography>
            </Chip>
            <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
              <Typography size="h3" weight="medium">
                Arbitrum
              </Typography>
            </Chip>
            <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
              <Typography size="h3" weight="medium">
                Solana
              </Typography>
            </Chip>
          </div>
        </div>
        <div
          className={`${showAssetSelector && "opacity-0"} flex flex-col gap-4 transition-opacity`}
        >
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Typography size="h5" weight="bold">
                  Send
                </Typography>
                <Typography size="h5" weight="medium">
                  ~224.51 USD
                </Typography>
              </div>
            </div>
            <div className="flex justify-between">
              <Typography size="h2" weight="bold">
                <input
                  className="flex-grow outline-none"
                  type="text"
                  value={sendAmount}
                  placeholder="0.0"
                  onChange={(e) =>
                    handleChange(e.target.value, 8, setSendAmount)
                  }
                />
              </Typography>
              <div className="flex items-center gap-3">
                <Typography size="h2" weight="medium">
                  BTC
                </Typography>
                <BTCLogo />
                <KeyboardDownIcon
                  className="cursor-pointer"
                  onClick={() => setShowAssetSelector(true)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Typography size="h5" weight="bold">
                  Receive
                </Typography>
                <Typography size="h5" weight="medium">
                  ~224.51 USD
                </Typography>
              </div>
              <div className="flex gap-1 items-center">
                <TimerIcon className="h-4" />
                <Typography size="h5" weight="medium">
                  ~2m 30s
                </Typography>
              </div>
            </div>
            <div className="flex justify-between">
              <Typography size="h2" weight="bold">
                <input
                  className="flex-grow outline-none"
                  type="text"
                  value={receiveAmount}
                  placeholder="0.0"
                  onChange={(e) =>
                    handleChange(e.target.value, 8, setReceiveAmount)
                  }
                />
              </Typography>
              <div className="flex items-center gap-3">
                <Typography size="h2" weight="medium">
                  WBTC
                </Typography>
                <BTCLogo />
                <KeyboardDownIcon
                  className="cursor-pointer"
                  onClick={() => setShowAssetSelector(true)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
            <Typography size="h5" weight="bold">
              Refund address
            </Typography>
            <Typography size="h3" weight="medium">
              <input
                className="flex-grow outline-none"
                type="text"
                placeholder="Your Bitcoin address"
              />
            </Typography>
          </div>
          <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
            <Typography size="h5" weight="bold">
              Fees
            </Typography>
            <Typography size="h3" weight="bold">
              0.0003256 BTC
            </Typography>
          </div>
          <Button size="lg">Swap</Button>
        </div>
      </div>
    </div>
  );
};
