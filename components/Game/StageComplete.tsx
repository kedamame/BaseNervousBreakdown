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
}

export function StageComplete({
  stage,
  moves,
  totalPairs,
  scoreStatus,
  recordError,
  onNextStage,
}: StageCompleteProps) {
  const { t } = useT();
  const isRecording = scoreStatus === "sending" || scoreStatus === "confirming";
  const efficiency = totalPairs > 0 ? totalPairs / moves : 0;
  const stars =
    efficiency >= 0.8 ? 3 : efficiency >= 0.6 ? 2 : efficiency >= 0.4 ? 1 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
      {/* Celebration */}
      <div className="text-6xl mb-4">
        {stars === 3 ? "🌟" : stars === 2 ? "⭐" : "✨"}
      </div>

      <h2 className="text-3xl font-bold text-white mb-1">
        {t.stageComplete.cleared(stage)}
      </h2>
      <p className="text-gray-400 text-sm mb-6">{t.stageComplete.nextStageHint}</p>

      {/* Stars */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`text-3xl transition-all ${
              i <= stars ? "opacity-100 scale-110" : "opacity-20"
            }`}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Score details */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 w-full max-w-xs mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm">{t.stageComplete.pairsLabel}</span>
          <span className="text-white font-semibold">{t.stageComplete.pairsValue(totalPairs)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm">{t.stageComplete.movesLabel}</span>
          <span className="text-white font-semibold">{t.stageComplete.movesValue(moves)}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-gray-400 text-sm">{t.stageComplete.efficiency}</span>
          <span
            className={`font-semibold ${
              efficiency >= 0.8
                ? "text-green-400"
                : efficiency >= 0.6
                ? "text-yellow-400"
                : "text-orange-400"
            }`}
          >
            {Math.round(efficiency * 100)}%
          </span>
        </div>
      </div>

      {/* On-chain status */}
      {scoreStatus === "sending" ? (
        <div className="flex items-center gap-2 text-purple-400 text-sm mb-4">
          <span className="animate-spin">⟳</span>
          <span>{t.stageComplete.sendingTx}</span>
        </div>
      ) : scoreStatus === "confirming" ? (
        <div className="flex items-center gap-2 text-purple-400 text-sm mb-4">
          <span className="animate-spin">⟳</span>
          <span>{t.stageComplete.confirmingTx}</span>
        </div>
      ) : scoreStatus === "confirmed" ? (
        <div className="text-green-400 text-xs mb-4">
          {t.stageComplete.recorded}
        </div>
      ) : scoreStatus === "skipped" ? (
        <div className="text-gray-500 text-xs mb-4">
          {t.stageComplete.offline}
        </div>
      ) : recordError ? (
        <div className="text-yellow-400 text-xs mb-4 max-w-xs">
          {t.stageComplete.failed}
        </div>
      ) : null}

      {/* Next stage button */}
      <button
        onClick={onNextStage}
        disabled={isRecording}
        className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 text-white font-bold text-lg
          hover:from-purple-600 hover:to-purple-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecording ? t.stageComplete.recordingButton : t.stageComplete.nextButton(stage + 1)}
      </button>
    </div>
  );
}
