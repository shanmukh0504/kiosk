import { ReactNode } from "react";
import { GardenLogo, GMXLogo } from "@gardenfi/garden-book";

export enum Partner {
  Vertex = "vertex",
  Gmx = "gmx",
  Radiant = "radiant",
  Garden = "garden",
  Camelot = "camelot",
  LFG = "traderjoe",
  Pancake = "pancake",
  ArkDigital = "arkdigital",
  Dodo = "dodo",
  Solv = "solv",
}

export type QuestInfo = {
  name: string;
  description: string;
  logo: ReactNode;
  amount: number;
  partner: Partner;
  link?: string;
  logoLink: string;
};

export const QuestsInfo: QuestInfo[] = [
  {
    name: "Garden",
    description: "Complete our social quest to earn SEED reward.",
    logo: <GardenLogo />,
    amount: 20,
    partner: Partner.Garden,
    logoLink: "https://garden.finance",
  },
  {
    name: "Solv",
    description: "Participate in the Solv points system by minting SolvBTC.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Solv,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://app.solv.finance/points/HLYMVK",
  },
  {
    name: "DODO",
    description: "Provide LP into SolvBTC/WBTC pool on DODO.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Dodo,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink:
      "https://app.dodoex.io/pool/0xf1701c198641e51d41efff734b19cfbcd1c688ff?network=arbitrum",
  },
  {
    name: "Aark Digital",
    description: "Provide LP into WBTC single-sided pool on Aark.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.ArkDigital,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://app.aark.digital/account/lp",
  },
  {
    name: "PancakeSwap",
    description:
      "Stake minimum $5 liquidity in the WBTC-ETH (0.01% fee tier) Farm.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Pancake,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink:
      "https://pancakeswap.finance/info/v3/arb/pairs/0x4bfc22A4dA7f31F8a912a79A7e44a822398b4390?chain=arb",
  },
  {
    name: "Let's F***ing Joe",
    description:
      "Deposit WBTC-ETH into CLMM LP pool to earn yield and SEED rewards.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.LFG,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://lfj.gg",
  },
  {
    name: "Camelot",
    description:
      "Deposit WBTC-ETH into V3 LP pool to earn yield and SEED rewards.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Camelot,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://camelot.exchange",
  },
  {
    name: "GMX",
    description:
      "Deposit WBTC into GMX's new [BTC] Single-Token Pool to earn yield.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Gmx,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://gmx.io",
  },
  {
    name: "Vertex",
    description:
      "Deposit WBTC into Vertex to explore their Bitcoin yield opportunities.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Vertex,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://vertexprotocol.com",
  },
  {
    name: "Radiant",
    description:
      "Lend WBTC on Radiant using their 1-Click Leverage option to earn enhanced yield.",
    logo: <GMXLogo />,
    amount: 20,
    partner: Partner.Radiant,
    link: "https://garden.finance/blogs/season-3-quests/",
    logoLink: "https://radiant.capital",
  },
];
