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
    <div className="w-full flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
      {/* Stage */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {t.scoreboard.stage}
        </span>
        <span className="text-xl font-bold text-purple-400">{stage}</span>
      </div>

      {/* Progress */}
      <div className="flex flex-col items-center flex-1 mx-4">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-gray-500">
            {t.scoreboard.pairsOf(matchedPairs, totalPairs)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-500"
            style={{
              width: totalPairs > 0 ? `${(matchedPairs / totalPairs) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {/* Moves */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {t.scoreboard.moves}
        </span>
        <span className="text-xl font-bold text-white">{moves}</span>
      </div>
    </div>
  );
}
