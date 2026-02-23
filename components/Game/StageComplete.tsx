"use client";

import { ScoreStatus } from "@/hooks/useScore";
import { useT } from "@/lib/i18n";

interface StageCompleteProps {
  stage: number;
  moves: number;
  totalPairs: number;
  scoreStatus: ScoreStatus;
  recordError: string | null;
  onNextStage: () => void;
  hp: number;
  maxHp: number;
}

export function StageComplete({
  stage,
  moves,
  totalPairs,
  scoreStatus,
  recordError,
  onNextStage,
  hp,
  maxHp,
}: StageCompleteProps) {
  const { t } = useT();
  const isRecording = scoreStatus === "sending" || scoreStatus === "confirming";
  const efficiency = totalPairs > 0 ? totalPairs / moves : 0;
  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const hpBarColor = hp > 60 ? "bg-purple-500" : hp > 30 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center font-mono voxel-grid">
      {/* Voxel icon */}
      <div className="text-5xl font-black text-white mb-4 select-none">▣</div>

      <h2 className="text-2xl font-black text-white mb-1 tracking-widest uppercase">
        {t.stageComplete.cleared(stage)}
      </h2>
      <p className="text-white/40 text-xs mb-6 tracking-widest uppercase">{t.stageComplete.nextStageHint}</p>

      {/* Score details */}
      <div className="bg-surface-2 border border-white/10 p-5 w-full max-w-xs mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-xs uppercase tracking-widest">{t.stageComplete.pairsLabel}</span>
          <span className="text-white font-black">{t.stageComplete.pairsValue(totalPairs)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-xs uppercase tracking-widest">{t.stageComplete.movesLabel}</span>
          <span className="text-white font-black">{t.stageComplete.movesValue(moves)}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-white/40 text-xs uppercase tracking-widest">{t.stageComplete.efficiency}</span>
          <span
            className={`font-black ${
              efficiency >= 0.8
                ? "text-purple-400"
                : efficiency >= 0.6
                ? "text-white/80"
                : "text-white/50"
            }`}
          >
            {Math.round(efficiency * 100)}%
          </span>
        </div>
        {/* HP remaining */}
        <div className="pt-3 border-t border-white/10 mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/40 text-xs uppercase tracking-widest">HP</span>
            <span className={`text-xs font-black ${hp <= 30 ? "text-red-400" : "text-white/60"}`}>{hp} / {maxHp}</span>
          </div>
          <div className="w-full h-2 bg-surface border border-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${hpBarColor}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* On-chain status */}
      {scoreStatus === "sending" ? (
        <div className="flex items-center gap-2 text-purple-400 text-xs mb-4 uppercase tracking-widest">
          <span className="animate-spin">⟳</span>
          <span>{t.stageComplete.sendingTx}</span>
        </div>
      ) : scoreStatus === "confirming" ? (
        <div className="flex items-center gap-2 text-purple-400 text-xs mb-4 uppercase tracking-widest">
          <span className="animate-spin">⟳</span>
          <span>{t.stageComplete.confirmingTx}</span>
        </div>
      ) : scoreStatus === "confirmed" ? (
        <div className="text-purple-400 text-xs mb-4 tracking-widest">
          {t.stageComplete.recorded}
        </div>
      ) : scoreStatus === "skipped" ? (
        <div className="text-white/30 text-xs mb-4 tracking-widest">
          {t.stageComplete.offline}
        </div>
      ) : recordError ? (
        <div className="text-white/50 text-xs mb-4 max-w-xs tracking-widest">
          {t.stageComplete.failed}
        </div>
      ) : null}

      {/* Next stage button */}
      <button
        onClick={onNextStage}
        disabled={isRecording}
        className="w-full max-w-xs py-4 bg-surface border border-purple-500 text-purple-400 font-black text-base uppercase tracking-widest
          hover:bg-purple-500/10 hover:border-purple-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecording ? t.stageComplete.recordingButton : t.stageComplete.nextButton(stage + 1)}
      </button>
    </div>
  );
}
