export type ErrorFormat = 
| `Minimum amount is ${string} ${string}` 
| `Maximum amount is ${string} ${string}` 
| "Output amount too high" 
| "Output amount too less"
| "Insufficient Liquidity"
| "Insufficient Balance"
| "";

export const Errors = {
    minError: (amount: string, asset: string): ErrorFormat =>
      `Minimum amount is ${amount} ${asset}`,
    maxError: (amount: string, asset: string): ErrorFormat =>
      `Maximum amount is ${amount} ${asset}`,
    outHigh: "Output amount too high" as const,
    outLow: "Output amount too less" as const,
    insufficientLiquidity: "Insufficient Liquidity" as const,
    insufficientBalance: "Insufficient Balance" as const,
    none: "" as const,
  } as const;