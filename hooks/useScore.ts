"use client";

import { useCallback, useState } from "react";
import { useWriteContract, usePublicClient, useChainId, useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { MEMORY_GAME_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import type { BaseError } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type ScoreStatus = "idle" | "switching_chain" | "sending" | "confirming" | "confirmed" | "skipped" | "error";

type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

/** Switch to Base Mainnet.
 *  1. Tries wagmi switchChainAsync first (correct for the connected connector).
 *  2. For injected wallets (Rabby/MetaMask) only: falls back to window.ethereum
 *     direct call if wagmi fails (handles edge cases where wagmi path doesn't
 *     trigger the popup for injected connectors).
 *  After wallet_addEthereumChain (4902) a follow-up switch is issued explicitly. */
async function switchToBase(
  chainId: number,
  wagmiSwitch: () => Promise<unknown>,
  isInjectedConnector: boolean
): Promise<void> {
  if (chainId === base.id) return;

  // Primary: use wagmi to switch via the connected connector
  try {
    await wagmiSwitch();
    return;
  } catch (originalErr) {
    // TypeError means the connector doesn't implement getChainId / switchChain
    // (e.g. @farcaster/miniapp-wagmi-connector). This is a connector compatibility
    // issue, not a user-facing error. Skip switching and let the TX attempt proceed —
    // the provider will reject with a chain mismatch if the wallet is actually on the
    // wrong chain.
    if (originalErr instanceof TypeError) return;

    // window.ethereum fallback is only safe when using an injected connector
    // (where window.ethereum IS the connected wallet). For non-injected
    // connectors (Coinbase, WalletConnect, Farcaster), propagate the error.
    if (!isInjectedConnector) throw originalErr;
  }

  const provider = typeof window !== "undefined"
    ? (window as Window & { ethereum?: EthProvider }).ethereum
    : null;

  if (!provider) throw new Error("Cannot switch to Base: no compatible wallet provider found");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base Mainnet = 8453
    });
  } catch (err) {
    if ((err as { code?: number | string }).code == 4902) { // == handles both number and string "4902"
      // Base not in wallet yet — add it, then switch explicitly
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x2105",
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"],
        }],
      });
      // Explicitly switch after adding (some wallets don't auto-switch)
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
    } else {
      throw err;
    }
  }
}

export function useScore() {
  const [status, setStatus] = useState<ScoreStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { address, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const recordScore = useCallback(
    async (stage: number, moves: number): Promise<boolean> => {
      setError(null);

      // Skip gracefully if contract is not deployed yet
      if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
        console.warn("Contract address not set — skipping on-chain record");
        setStatus("skipped");
        return true;
      }

      try {
        // Switch to Base right before sending the TX.
        // window.ethereum fallback is only used for injected connectors (Rabby/MetaMask).
        const isInjected = connector?.type === "injected";
        if (chainId !== base.id) {
          setStatus("switching_chain");
          await switchToBase(chainId, () => switchChainAsync({ chainId: base.id }), isInjected);
        }

        // Simulate first to catch contract reverts (cooldown, invalid args, etc.)
        if (publicClient && address) {
          await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: MEMORY_GAME_ABI,
            functionName: "recordGame",
            args: [stage, moves],
            account: address,
          });
        }

        setStatus("sending");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: MEMORY_GAME_ABI,
          functionName: "recordGame",
          args: [stage, moves],
        });

        setStatus("confirming");
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
        }

        setStatus("confirmed");
        return true;
      } catch (err) {
        console.error("[useScore] recordScore error:", err);
        const viemErr = err as BaseError;
        const msg =
          viemErr.shortMessage ||
          (err instanceof Error ? err.message.split("\n")[0] : "Transaction failed");
        setError(msg);
        setStatus("error");
        return false;
      }
    },
    [writeContractAsync, publicClient, chainId, address, connector, switchChainAsync]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    recordScore,
    status,
    isPending: status === "switching_chain" || status === "sending" || status === "confirming",
    isSuccess: status === "confirmed" || status === "skipped",
    isSkipped: status === "skipped",
    error,
    reset,
  };
}
