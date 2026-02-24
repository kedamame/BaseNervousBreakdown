"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useT } from "@/lib/i18n";

interface LeaderboardProps {
  onBack: () => void;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const { t } = useT();
  const { address } = useAccount();
  const { entries, isLoading, error, fetchLeaderboard } = useLeaderboard();

  // Auto-fetch on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="flex flex-col min-h-screen bg-background font-mono voxel-grid">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="text-white/50 text-xs uppercase tracking-widest hover:text-white transition-colors px-2 py-1"
        >
          ← {t.leaderboard.back}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm select-none">▣</span>
          <span className="text-white font-black text-sm uppercase tracking-widest">
            {t.leaderboard.title}
          </span>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="text-white/50 text-xs uppercase tracking-widest hover:text-white transition-colors px-2 py-1 disabled:opacity-30"
        >
          {isLoading ? (
            <span className="animate-spin inline-block">⟳</span>
          ) : (
            "⟳"
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-purple-400 text-2xl animate-spin select-none">⟳</span>
            <p className="text-white/40 text-xs uppercase tracking-widest">{t.leaderboard.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-400 text-xs uppercase tracking-widest">⚠ {t.leaderboard.loadFailed}</p>
            <p className="text-white/30 text-[10px] break-all max-w-xs text-center leading-relaxed">
              {error.length > 120 ? error.slice(0, 120) + "…" : error}
            </p>
            <button
              onClick={fetchLeaderboard}
              className="px-5 py-2 bg-surface border border-white/15 text-white/60 text-xs font-black uppercase tracking-widest
                hover:border-purple-500/60 hover:text-white transition-all active:scale-95"
            >
              {t.leaderboard.retry}
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-white/20 text-4xl select-none">▣</span>
            <p className="text-white/40 text-xs uppercase tracking-widest">{t.leaderboard.noScores}</p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[2rem_1fr_3rem_3.5rem] gap-x-2 mb-2 px-2">
              <span className="text-white/30 text-[10px] uppercase tracking-widest text-center">
                {t.leaderboard.rank}
              </span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest">
                {t.leaderboard.player}
              </span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest text-center">
                {t.leaderboard.stage}
              </span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest text-right">
                {t.leaderboard.moves}
              </span>
            </div>

            {/* Entries */}
            <div className="flex flex-col gap-1">
              {entries.map((entry, i) => {
                const isMe =
                  address &&
                  entry.address.toLowerCase() === address.toLowerCase();
                const rankColor =
                  i === 0
                    ? "text-yellow-400"
                    : i === 1
                    ? "text-white/60"
                    : i === 2
                    ? "text-amber-600"
                    : "text-white/30";

                return (
                  <div
                    key={entry.address}
                    className={`grid grid-cols-[2rem_1fr_3rem_3.5rem] gap-x-2 items-center px-2 py-2
                      border ${isMe ? "border-purple-500/40 bg-purple-500/5" : "border-white/5 bg-surface/50"}`}
                  >
                    {/* Rank */}
                    <span className={`text-xs font-black text-center ${rankColor}`}>
                      {i + 1}
                    </span>

                    {/* Address */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-white/70 text-xs tracking-wider truncate">
                        {shortAddr(entry.address)}
                      </span>
                      {isMe && (
                        <span className="text-purple-400 text-[9px] uppercase tracking-wider shrink-0 border border-purple-500/50 px-1">
                          {t.leaderboard.myScore}
                        </span>
                      )}
                    </div>

                    {/* Stage */}
                    <span className="text-white font-black text-xs text-center">
                      {entry.stage}
                    </span>

                    {/* Moves */}
                    <span className="text-white/50 text-xs text-right">
                      {entry.moves}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
