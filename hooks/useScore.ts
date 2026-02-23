"use client";

import { useCallback, useState } from "react";
import { useWriteContract, usePublicClient, useChainId, useSwitchChain, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { MEMORY_GAME_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import type { BaseError } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type ScoreStatus = "idle" | "sending" | "confirming" | "confirmed" | "skipped" | "error";

export function useScore() {
  const [status, setStatus] = useState<ScoreStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();

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
        // Best-effort chain switch before submitting
        if (chainId !== base.id) {
          try {
            await switchChainAsync({ chainId: base.id });
          } catch {
            // Connector may not support switchChain; continue anyway
          }
        }

        // Simulate first to catch contract reverts (cooldown, invalid args, etc.)
        // before showing the wallet prompt. Gives specific revert reasons.
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
        // viem BaseError has a concise shortMessage; fall back to first line of message
        const viemErr = err as BaseError;
        const msg =
          viemErr.shortMessage ||
          (err instanceof Error ? err.message.split("\n")[0] : "Transaction failed");
        setError(msg);
        setStatus("error");
        return false;
      }
    },
    [writeContractAsync, publicClient, chainId, switchChainAsync, address]
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
