"use client";

import { ScoreStatus } from "@/hooks/useScore";
import { useT } from "@/lib/i18n";

interface GameOverProps {
  stage: number;
  totalMoves: number;
  scoreStatus: ScoreStatus;
  recordError: string | null;
}

export function GameOver({ stage, totalMoves, scoreStatus, recordError }: GameOverProps) {
  const { t } = useT();
  const isRecording = scoreStatus === "sending" || scoreStatus === "confirming";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center font-mono voxel-grid">
      {/* Icon */}
      <div className="text-5xl font-black text-red-500 mb-4 select-none">✕</div>

      <h2 className="text-2xl font-black text-white mb-1 tracking-widest uppercase">
        {t.gameOver.title}
      </h2>

      {/* Stats */}
      <div className="bg-surface-2 border border-white/10 p-5 w-full max-w-xs mb-6 mt-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-xs uppercase tracking-widest">Stage</span>
          <span className="text-white font-black">{t.gameOver.stageReached(stage)}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-white/40 text-xs uppercase tracking-widest">Moves</span>
          <span className="text-white font-black">{t.gameOver.totalMoves(totalMoves)}</span>
        </div>
      </div>

      {/* On-chain status */}
      {scoreStatus === "sending" ? (
        <div className="flex items-center gap-2 text-purple-400 text-xs mb-4 uppercase tracking-widest">
          <span className="animate-spin">⟳</span>
          <span>{t.gameOver.sendingTx}</span>
        </div>
      ) : scoreStatus === "confirming" ? (
        <div className="flex items-center gap-2 text-purple-400 text-xs mb-4 uppercase tracking-widest">
          <span className="animate-spin">⟳</span>
          <span>{t.gameOver.confirmingTx}</span>
        </div>
      ) : scoreStatus === "confirmed" ? (
        <div className="text-purple-400 text-xs mb-4 tracking-widest">
          {t.gameOver.recorded}
        </div>
      ) : scoreStatus === "skipped" ? (
        <div className="text-white/30 text-xs mb-4 tracking-widest">
          {t.gameOver.offline}
        </div>
      ) : recordError ? (
        <div className="text-white/50 text-xs mb-4 tracking-widest">
          {t.gameOver.failed}
        </div>
      ) : null}

      {/* Restart button */}
      <button
        onClick={() => window.location.reload()}
        disabled={isRecording}
        className="w-full max-w-xs py-4 bg-surface border border-red-500/60 text-red-400 font-black text-base uppercase tracking-widest
          hover:bg-red-500/10 hover:border-red-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t.gameOver.restart}
      </button>
    </div>
  );
}
