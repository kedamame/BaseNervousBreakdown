"use client";

import { useT } from "@/lib/i18n";

interface ScoreBoardProps {
  stage: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  hp: number;
  maxHp: number;
  consecutiveMisses: number;
}

export function ScoreBoard({
  stage,
  moves,
  matchedPairs,
  totalPairs,
  hp,
  maxHp,
  consecutiveMisses,
}: ScoreBoardProps) {
  const { t } = useT();

  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const hpBarColor =
    hp > 60 ? "bg-purple-500" : hp > 30 ? "bg-yellow-500" : "bg-red-500";
  const hpPulse = hp <= 30 ? "animate-pulse" : "";

  return (
    <div className="w-full bg-surface border-b border-white/10 font-mono">
      {/* Row 1: Stage | Pairs progress | Moves */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex flex-col items-center min-w-[48px]">
          <span className="text-[10px] text-white/40 uppercase tracking-widest">
            {t.scoreboard.stage}
          </span>
          <span className="text-2xl font-black text-purple-400 leading-none">{stage}</span>
        </div>

        <div className="flex flex-col items-center flex-1 mx-4">
          <span className="text-[10px] text-white/50 mb-1">
            {t.scoreboard.pairsOf(matchedPairs, totalPairs)}
          </span>
          <div className="w-full h-2 bg-surface-2 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: totalPairs > 0 ? `${(matchedPairs / totalPairs) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[48px]">
          <span className="text-[10px] text-white/40 uppercase tracking-widest">
            {t.scoreboard.moves}
          </span>
          <span className="text-2xl font-black text-white leading-none">{moves}</span>
        </div>
      </div>

      {/* Row 2: HP bar */}
      <div className="px-4 pb-2 flex items-center gap-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest shrink-0 w-6">
          {t.scoreboard.hp}
        </span>
        <div className="flex-1 h-2 bg-surface-2 border border-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${hpBarColor} ${hpPulse}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className={`text-[10px] font-black shrink-0 w-8 text-right ${hp <= 30 ? "text-red-400" : "text-white/60"}`}>
          {hp}
        </span>
        {consecutiveMisses >= 2 && (
          <span className="text-[10px] text-red-400 uppercase tracking-widest shrink-0 animate-pulse">
            {t.scoreboard.combo(consecutiveMisses)}
          </span>
        )}
      </div>
    </div>
  );
}
