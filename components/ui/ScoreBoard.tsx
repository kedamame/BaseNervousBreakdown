"use client";

import { useT } from "@/lib/i18n";

interface ScoreBoardProps {
  stage: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
}

export function ScoreBoard({
  stage,
  moves,
  matchedPairs,
  totalPairs,
}: ScoreBoardProps) {
  const { t } = useT();
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-surface border-b border-white/10 font-mono">
      {/* Stage */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">
          {t.scoreboard.stage}
        </span>
        <span className="text-2xl font-black text-purple-400 leading-none">{stage}</span>
      </div>

      {/* Progress bar + pairs */}
      <div className="flex flex-col items-center flex-1 mx-4">
        <span className="text-[10px] text-white/50 mb-1">
          {t.scoreboard.pairsOf(matchedPairs, totalPairs)}
        </span>
        {/* Pixel-style progress bar */}
        <div className="w-full h-2 bg-surface-2 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{
              width: totalPairs > 0 ? `${(matchedPairs / totalPairs) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {/* Moves */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">
          {t.scoreboard.moves}
        </span>
        <span className="text-2xl font-black text-white leading-none">{moves}</span>
      </div>
    </div>
  );
}
