"use client";

import { useCallback, useState } from "react";
import { useWriteContract, usePublicClient, useChainId, useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { MEMORY_GAME_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import type { BaseError } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type ScoreStatus = "idle" | "switching_chain" | "sending" | "confirming" | "confirmed" | "skipped" | "error";

type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

const BASE_CHAIN_HEX = "0x2105"; // 8453

/** Attempt wallet_switchEthereumChain + 4902 fallback on the given provider. */
async function switchProviderToBase(provider: EthProvider): Promise<void> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
  } catch (err) {
    if ((err as { code?: number | string }).code == 4902) { // == handles both number and string
      // Base not in wallet yet — add it, then switch explicitly
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: BASE_CHAIN_HEX,
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"],
        }],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_HEX }],
      });
    } else {
      throw err;
    }
  }
}

/** Switch to Base Mainnet.
 *  1. Primary: wagmi switchChainAsync (works for all connector types; for EIP-6963
 *     wallets like Rabby it uses the wallet's own provider, not window.ethereum).
 *  2. Fallback (injected only): call wallet_switchEthereumChain via the connector's
 *     own provider — avoids wagmi's changePromise race and also avoids calling the
 *     wrong wallet when window.ethereum belongs to a different installed extension.
 *  getConnectorProvider is only provided for injected connectors. */
async function switchToBase(
  wagmiSwitch: () => Promise<unknown>,
  getConnectorProvider: (() => Promise<EthProvider | null>) | null,
): Promise<void> {
  // Primary: use wagmi to switch via the connected connector
  try {
    await wagmiSwitch();
    return;
  } catch (originalErr) {
    // TypeError = connector stub without methods (shouldn't happen after connector fix,
    // but keep as safety net). Proceed and let the TX attempt surface any real error.
    if (originalErr instanceof TypeError) return;

    // For non-injected connectors (Coinbase, etc.) there is no reliable direct fallback.
    if (!getConnectorProvider) throw originalErr;
  }

  // Fallback: call wallet_switchEthereumChain directly via the connector's own provider.
  // Using connector.getProvider() (not window.ethereum) is critical for EIP-6963 wallets
  // like Rabby where window.ethereum may point to a different installed wallet extension.
  const provider = await getConnectorProvider();
  if (!provider) throw new Error("Cannot switch to Base: no wallet provider found");
  await switchProviderToBase(provider);
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
        const isFarcaster = connector?.type === "farcasterMiniApp";
        const isInjected = connector?.type === "injected";

        if (!isFarcaster) {
          // Re-query the actual chain directly from the connector rather than relying on
          // wagmi's cached useChainId() value, which can lag behind the real wallet state
          // (especially with EIP-6963 wallets like Rabby on first connect).
          let actualChainId = chainId;
          try { actualChainId = await connector!.getChainId(); } catch { /* use cached */ }

          if (actualChainId !== base.id) {
            setStatus("switching_chain");
            // For injected connectors: pass a getProvider function so the fallback uses
            // the connector's own EIP-6963 provider instead of window.ethereum (which may
            // belong to a different installed wallet extension).
            const getConnectorProvider = isInjected
              ? async (): Promise<EthProvider | null> => {
                  try { return (await connector!.getProvider()) as EthProvider; } catch { return null; }
                }
              : null;
            await switchToBase(() => switchChainAsync({ chainId: base.id }), getConnectorProvider);
          }
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
