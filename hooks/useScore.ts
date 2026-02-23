"use client";

import { useCallback, useState } from "react";
import { useWriteContract, usePublicClient, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { MEMORY_GAME_ABI, CONTRACT_ADDRESS } from "@/lib/constants";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type ScoreStatus = "idle" | "sending" | "confirming" | "confirmed" | "skipped" | "error";

export function useScore() {
  const [status, setStatus] = useState<ScoreStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
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
        // Auto-switch to Base mainnet before sending
        if (chainId !== base.id) {
          await switchChainAsync({ chainId: base.id });
        }

        setStatus("sending");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: MEMORY_GAME_ABI,
          functionName: "recordGame",
          args: [stage, moves],
        });

        // Wait for the transaction to be mined (1 confirmation)
        setStatus("confirming");
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
        }

        setStatus("confirmed");
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        setStatus("error");
        return false;
      }
    },
    [writeContractAsync, publicClient, chainId, switchChainAsync]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    recordScore,
    status,
    isPending: status === "sending" || status === "confirming",
    isSuccess: status === "confirmed" || status === "skipped",
    isSkipped: status === "skipped",
    error,
    reset,
  };
}
