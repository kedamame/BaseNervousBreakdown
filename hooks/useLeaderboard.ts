"use client";

import { useCallback, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { CONTRACT_ADDRESS } from "@/lib/constants";

export interface LeaderboardEntry {
  address: `0x${string}`;
  stage: number;
  moves: number;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Must match the deployed contract's event signature exactly.
const GAME_COMPLETED_EVENT = parseAbiItem(
  "event GameCompleted(address indexed player, uint32 stage, uint32 moves)"
);

// Optional env var: block number from which to start fetching logs.
// Set NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK in .env.local after deploying the contract.
const DEPLOY_BLOCK = BigInt(
  process.env.NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK ?? 0
);

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient) return;

    if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
      setEntries([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: GAME_COMPLETED_EVENT,
        fromBlock: DEPLOY_BLOCK,
        toBlock: "latest",
      });

      // Aggregate: best score per player (highest stage; fewest moves as tiebreaker)
      const bestByPlayer = new Map<string, LeaderboardEntry>();
      for (const log of logs) {
        const { player, stage, moves } = log.args;
        if (!player || stage === undefined || moves === undefined) continue;
        const s = Number(stage);
        const m = Number(moves);
        const existing = bestByPlayer.get(player);
        if (!existing || s > existing.stage || (s === existing.stage && m < existing.moves)) {
          bestByPlayer.set(player, { address: player, stage: s, moves: m });
        }
      }

      const sorted = Array.from(bestByPlayer.values())
        .sort((a, b) => b.stage - a.stage || a.moves - b.moves)
        .slice(0, 20);

      setEntries(sorted);
    } catch (err) {
      console.error("[useLeaderboard] fetch error:", err);
      setError(
        err instanceof Error ? err.message.split("\n")[0] : "Failed to load leaderboard"
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  return { entries, isLoading, error, fetchLeaderboard };
}
