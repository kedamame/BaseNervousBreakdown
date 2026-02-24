"use client";

import { useCallback, useState } from "react";
import { CONTRACT_ADDRESS } from "@/lib/constants";

export interface LeaderboardEntry {
  address: string;
  stage: number;
  moves: number;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
      setEntries([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json() as { entries?: LeaderboardEntry[]; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch leaderboard");
      }

      setEntries(data.entries ?? []);
    } catch (err) {
      console.error("[useLeaderboard] fetch error:", err);
      setError(
        err instanceof Error ? err.message.split("\n")[0] : "Failed to load leaderboard"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { entries, isLoading, error, fetchLeaderboard };
}
