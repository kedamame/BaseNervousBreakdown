"use client";

interface LoadingScreenProps {
  progress: number;
  message: string;
  stage: number;
}

export function LoadingScreen({ progress, message, stage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
      {/* Logo / Title */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Base<span className="text-purple-500">神経衰弱</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Memory Card Game on Base</p>
      </div>

      {/* Stage indicator */}
      {stage > 1 && (
        <div className="mb-6 px-4 py-2 rounded-full bg-surface-2 border border-border">
          <span className="text-purple-400 text-sm font-medium">
            Stage {stage} を準備中...
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>読み込み中</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-gray-400 text-sm text-center animate-pulse">{message}</p>

      {/* Animated cards */}
      <div className="mt-12 flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-10 h-14 rounded-md bg-surface-2 border border-purple-900 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
