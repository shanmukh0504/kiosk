import { ChainData } from "../../store/assetInfoStore";
import {
  ArrowLeftIcon,
  GradientScroll,
  SearchIcon,
  Typography,
} from "@gardenfi/garden-book";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { viewPortStore } from "../../store/viewPortStore";
import { PHANTOM_SUPPORTED_CHAINS } from "../../constants/constants";

type SidebarProps = {
  show: boolean;
  chains: ChainData[];
  hide: () => void;
  onClick: (chain: ChainData) => void;
  isPhantomEvmConnected?: boolean;
};

export const AvailableChainsSidebar = ({
  show,
  chains,
  hide,
  onClick,
  isPhantomEvmConnected = false,
}: SidebarProps) => {
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = viewPortStore();

  const animationConfig = {
    initial: { x: "100%", opacity: 0 },
    animate: {
      x: show ? 0 : "100%",
      opacity: show ? 1 : 0,
    },
    transition: {
      type: "tween",
      ease: "easeInOut",
      stiffness: 200,
      damping: 25,
      mass: 0.8,
      duration: 0.4,
    },
  };

  const mobileAnimationConfig = {
    initial: { y: "100%", opacity: 0 },
    animate: {
      y: show ? 0 : "100%",
      opacity: show ? 1 : 0,
    },
    transition: {
      type: "tween",
      ease: "easeInOut",
      stiffness: 200,
      damping: 25,
      mass: 0.8,
      duration: 0.4,
    },
  };

  const filteredChains = useMemo(() => {
    let filtered = chains;
    if (input) {
      filtered = chains.filter((c) =>
        c.name.toLowerCase().includes(input.toLowerCase())
      );
    }
    if (isPhantomEvmConnected) {
      return filtered.sort((a, b) => {
        const aSupported = PHANTOM_SUPPORTED_CHAINS.includes(a.identifier);
        const bSupported = PHANTOM_SUPPORTED_CHAINS.includes(b.identifier);

        if (aSupported && !bSupported) return -1;
        if (!aSupported && bSupported) return 1;
        // Both supported or both unsupported: sort alphabetically
        return a.name.localeCompare(b.name);
      });
    }
    // Default: just alphabetical
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [chains, input, isPhantomEvmConnected]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <AnimatePresence>
      <motion.div
        {...(isMobile ? mobileAnimationConfig : animationConfig)}
        className={`absolute left-0 top-0 z-50 w-full rounded-[16px] p-3 ${isMobile ? "pt-7" : ""}`}
      >
        <div className="transition-left left-auto top-60 z-40 m-1 flex w-full flex-col gap-3 pr-2 duration-700 ease-cubic-in-out">
          <div className="flex items-center justify-between p-1">
            <Typography size="h4" weight="bold">
              Select chain
            </Typography>
            <ArrowLeftIcon onClick={hide} className="cursor-pointer" />
          </div>
          <div className="flex w-full items-center justify-between rounded-2xl bg-white/50 px-4 py-[10px]">
            <div className="flex flex-grow items-center">
              <Typography size="h4" weight="medium" className="gf-w-full">
                <input
                  ref={inputRef}
                  className="w-full bg-transparent outline-none placeholder:text-mid-grey focus:outline-none"
                  type="text"
                  value={input}
                  placeholder="Search chains"
                  onChange={handleSearch}
                />
              </Typography>
            </div>
            <SearchIcon />
          </div>
          <div
            className={`flex h-full max-h-[388px] flex-col overflow-auto rounded-2xl bg-white`}
          >
            <GradientScroll
              height={isMobile ? 384 : 376}
              className="rounded-2xl"
            >
              <div className="flex w-full flex-col pb-1 pt-2">
                {filteredChains.length > 0 ? (
                  filteredChains.map((c) => {
                    const isDisabled =
                      isPhantomEvmConnected &&
                      !PHANTOM_SUPPORTED_CHAINS.includes(c.identifier);

                    return (
                      <div
                        key={c.chainId}
                        className="flex w-full cursor-pointer items-center justify-between hover:bg-off-white"
                        onClick={() => (isDisabled ? undefined : onClick(c))}
                      >
                        <div className="flex w-full items-center gap-4 px-[14px] py-2">
                          <img
                            src={c.networkLogo}
                            alt={c.name}
                            className={`h-5 w-5 rounded-full ${isDisabled ? "opacity-50" : ""}`}
                          />
                          <Typography
                            size={"h5"}
                            breakpoints={{ sm: "h4" }}
                            weight="medium"
                            className={`${isDisabled ? "opacity-50" : ""}`}
                          >
                            {c.name}
                          </Typography>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex min-h-[334px] w-full items-center justify-center">
                    <Typography
                      size="h4"
                      weight="medium"
                      className="text-center text-mid-grey"
                    >
                      No chains found.
                    </Typography>
                  </div>
                )}
              </div>
            </GradientScroll>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
