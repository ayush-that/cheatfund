import ChitFundFactoryABI from "./abis/ChitFundFactory.json";
import ChitFundABI from "./abis/ChitFund.json";

export const CONTRACTS = {
  CHITFUND_FACTORY: {
    address: process.env.NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS!,
    abi: ChitFundFactoryABI.abi,
  },
  CHITFUND: {
    abi: ChitFundABI.abi,
  },
} as const;

export const SUPPORTED_NETWORKS = {
  545: {
    name: "Flow Testnet",
    rpcUrl: "https://testnet.evm.nodes.onflow.org",
    blockExplorer: "https://evm-testnet.flowscan.io",
    chainId: 545,
  },
} as const;

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const CHITFUND_EVENTS = {
  MEMBER_JOINED: "MemberJoined",
  CONTRIBUTION_MADE: "ContributionMade",
  BID_SUBMITTED: "BidSubmitted",
  WINNER_SELECTED: "WinnerSelected",
  FUNDS_DISTRIBUTED: "FundsDistributed",
} as const;

export const CHITFUND_FACTORY_EVENTS = {
  CHITFUND_CREATED: "ChitFundCreated",
} as const;
