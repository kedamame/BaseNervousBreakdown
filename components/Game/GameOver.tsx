"use client";

import { ScoreStatus } from "@/hooks/useScore";
import { useT } from "@/lib/i18n";

interface GameOverProps {
  stage: number;
  totalMoves: number;
  scoreStatus: ScoreStatus;
  recordError: string | null;
  onRecordScore: () => void;
  onLeaderboard: () => void;
}

export function GameOver({ stage, totalMoves, scoreStatus, recordError, onRecordScore, onLeaderboard }: GameOverProps) {
  const { t } = useT();
  const isSwitchingChain = scoreStatus === "switching_chain";
  const isRecording = isSwitchingChain || scoreStatus === "sending" || scoreStatus === "confirming";
  const hasRecorded = scoreStatus === "confirmed" || scoreStatus === "skipped";
  const showRecordButton = !hasRecorded;

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
      {scoreStatus === "confirmed" ? (
        <div className="text-purple-400 text-xs mb-4 tracking-widest">
          {t.gameOver.recorded}
        </div>
      ) : scoreStatus === "skipped" ? (
        <div className="text-white/30 text-xs mb-4 tracking-widest">
          {t.gameOver.offline}
        </div>
      ) : recordError ? (
        <div className="mb-4 w-full max-w-xs text-left">
          <p className="text-red-400 text-xs tracking-widest mb-1">{t.gameOver.failed}</p>
          <p className="text-white/30 text-xs break-all leading-relaxed">
            {recordError.length > 120 ? recordError.slice(0, 120) + "…" : recordError}
          </p>
        </div>
      ) : null}

      {/* Record Score button */}
      {showRecordButton && (
        <button
          onClick={onRecordScore}
          disabled={isRecording}
          className="w-full max-w-xs py-4 bg-surface border border-purple-500/60 text-purple-400 font-black text-base uppercase tracking-widest
            hover:bg-purple-500/10 hover:border-purple-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {isRecording ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span>
              {isSwitchingChain
                ? t.gameOver.switchingChain
                : scoreStatus === "sending"
                ? t.gameOver.sendingTx
                : t.gameOver.confirmingTx}
            </span>
          ) : (
            t.gameOver.recordScore
          )}
        </button>
      )}

      {/* Leaderboard button */}
      <button
        onClick={onLeaderboard}
        disabled={isRecording}
        className="w-full max-w-xs py-3 bg-surface border border-white/15 text-white/50 font-black text-xs uppercase tracking-widest
          hover:border-purple-500/40 hover:text-white/70 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-3"
      >
        {t.leaderboard.view}
      </button>

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
