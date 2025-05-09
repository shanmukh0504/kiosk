import { motion, Variants } from "framer-motion";
import { SwapDetailsExpanded } from "./SwapDetailsExpanded";
import { SwapAddress } from "./SwapAddress";
import { TokenPrices } from "../../store/swapStore";

type SwapDetailsProps = {
  shouldShowDetails: boolean;
  shouldShowAddress: boolean;
  isValidBitcoinAddress: boolean;
  tokenPrices: TokenPrices;
};

export const SwapDetails = ({
  shouldShowDetails,
  shouldShowAddress,
  isValidBitcoinAddress,
  tokenPrices,
}: SwapDetailsProps) => {
  const detailsAnimation: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "12px",
      pointerEvents: "auto",
      transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
    },
  };

  const addressAnimation: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginBottom: "0",
      pointerEvents: "none" as const,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginBottom: "12px",
      pointerEvents: "auto" as const,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  return (
    <motion.div
      variants={detailsAnimation}
      initial="hidden"
      animate={shouldShowDetails ? "visible" : "hidden"}
      className={`flex flex-col overflow-hidden ${
        shouldShowDetails ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <motion.div
        variants={addressAnimation}
        initial="hidden"
        animate={shouldShowAddress ? "visible" : "hidden"}
      >
        <SwapAddress isValidAddress={isValidBitcoinAddress} />
      </motion.div>
      <SwapDetailsExpanded tokenPrices={tokenPrices} />
    </motion.div>
  );
};

export default SwapDetails;
