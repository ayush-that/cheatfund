import { ethers } from "ethers";
import { SUPPORTED_NETWORKS } from "./contracts";

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC || SUPPORTED_NETWORKS[545].rpcUrl;
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum wallet found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
}

export function formatEther(value: bigint): string {
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function checkNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return Number(network.chainId) === 545;
  } catch (error) {
    return false;
  }
}

export async function switchToFlowTestnet(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x221" }],
    } as any);
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x221",
              chainName: "Flow Testnet",
              nativeCurrency: {
                name: "Flow",
                symbol: "FLOW",
                decimals: 18,
              },
              rpcUrls: [SUPPORTED_NETWORKS[545].rpcUrl],
              blockExplorerUrls: [SUPPORTED_NETWORKS[545].blockExplorer],
            },
          ],
        } as any);
        return true;
      } catch (addError) {
        return false;
      }
    }
    return false;
  }
}
