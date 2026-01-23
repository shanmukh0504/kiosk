import { Typography, SwapHorizontalIcon } from "@gardenfi/garden-book";

export const RateAndPriceDisplay = ({
  inputToken,
  outputToken,
  rate,
  tokenPrice,
  className = "",
  isLoading = false,
}: {
  inputToken?: string;
  outputToken?: string;
  rate?: string | number;
  tokenPrice?: string | number;
  isLoading?: boolean;
  className?: string;
}) => (
  <div
    className={`flex min-w-fit items-center gap-1`}
    data-testid="rate-price-display"
  >
    <Typography
      size="h5"
      weight="regular"
      className={`!text-nowrap ${className}`}
    >
      1 {inputToken}
    </Typography>
    <Typography
      size="h5"
      weight="regular"
      className={`!text-nowrap ${className}`}
    >
      {tokenPrice ? "≈" : <SwapHorizontalIcon className="fill-dark-grey" />}
    </Typography>
    {isLoading ? (
      <div className="h-4 w-11 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
    ) : (
      <Typography
        size="h5"
        weight="regular"
        className={`!text-nowrap ${className}`}
        data-testid="rate-price-display-value"
      >
        {rate && `${rate}`}
        {tokenPrice && `$${tokenPrice}`}
      </Typography>
    )}
    {rate && (
      <Typography
        size="h5"
        weight="regular"
        className={`!text-nowrap ${className}`}
      >
        {outputToken}
      </Typography>
    )}
  </div>
);
