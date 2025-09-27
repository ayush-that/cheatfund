import * as fcl from "@onflow/fcl";

const FLOW_CONFIG = {
  testnet: {
    accessNode: "https://testnet.onflow.org",
    network: "testnet",
  },
};

export function initializeFlow() {
  const config = FLOW_CONFIG.testnet;

  fcl.config({
    "accessNode.api": config.accessNode,
    "flow.network": config.network,
  });
}

export function convertEthToFlowAddress(ethAddress: string): string | null {
  return null;
}

export async function getFlowBalance(address: string | null): Promise<number> {
  try {
    if (!address) {
      console.log("No valid Flow address provided, returning 0 balance");
      return 0;
    }
    initializeFlow();

    const formattedAddress = fcl.sansPrefix(address);
    const account = await fcl.account(formattedAddress);
    const balance = account.balance / 100000000;

    return balance;
  } catch (error) {
    console.error("Error fetching FLOW balance:", error);
    return 0;
  }
}

export async function getFlowBalanceWithRetry(
  address: string | null,
  retries: number = 3,
): Promise<number> {
  if (!address) {
    console.log("No valid Flow address provided, returning 0 balance");
    return 0;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const balance = await getFlowBalance(address);
      return balance;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error("All retry attempts failed");
        return 0;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }
  return 0;
}

export function formatFlowBalance(balance: number): string {
  return balance.toFixed(6);
}
