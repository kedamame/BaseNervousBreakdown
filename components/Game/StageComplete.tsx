"use client";

import { ScoreStatus } from "@/hooks/useScore";

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
        Stage {stage} クリア！
      </h2>
      <p className="text-gray-400 text-sm mb-6">次のステージへ進もう</p>

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
          <span className="text-gray-400 text-sm">ペア数</span>
          <span className="text-white font-semibold">{totalPairs} ペア</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm">手数</span>
          <span className="text-white font-semibold">{moves} 手</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-gray-400 text-sm">効率</span>
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
          <span>トランザクションを送信中...</span>
        </div>
      ) : scoreStatus === "confirming" ? (
        <div className="flex items-center gap-2 text-purple-400 text-sm mb-4">
          <span className="animate-spin">⟳</span>
          <span>Baseで確認中...</span>
        </div>
      ) : scoreStatus === "confirmed" ? (
        <div className="text-green-400 text-xs mb-4">
          ✓ スコアをBaseに記録しました
        </div>
      ) : scoreStatus === "skipped" ? (
        <div className="text-gray-500 text-xs mb-4">
          ～ オフラインモード（スコア記録なし）
        </div>
      ) : recordError ? (
        <div className="text-yellow-400 text-xs mb-4 max-w-xs">
          ⚠ スコアの記録に失敗（{recordError.slice(0, 50)}）
        </div>
      ) : null}

      {/* Next stage button */}
      <button
        onClick={onNextStage}
        disabled={isRecording}
        className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 text-white font-bold text-lg
          hover:from-purple-600 hover:to-purple-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecording ? "記録中..." : `Stage ${stage + 1} へ →`}
      </button>
    </div>
  );
}
