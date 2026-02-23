"use client";

import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface LoadingScreenProps {
  progress: number;
  message: string;
  stage: number;
}

export function LoadingScreen({ progress, message, stage }: LoadingScreenProps) {
  const { t } = useT();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 relative voxel-grid font-mono">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3 font-black tracking-widest select-none">
          <span className="text-white">▣</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-widest uppercase">
          Base<span className="text-purple-400"> Memory</span>
        </h1>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">{t.game.subtitle}</p>
      </div>

      {/* Stage indicator */}
      {stage > 1 && (
        <div className="mb-6 px-4 py-2 border border-purple-500/50 bg-surface">
          <span className="text-purple-400 text-xs font-mono tracking-widest uppercase">
            {t.loading.preparingStage(stage)}
          </span>
        </div>
      )}

      {/* Pixel progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-[10px] text-white/40 mb-2 uppercase tracking-widest">
          <span>{t.loading.loading}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-surface-2 border border-white/15 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Pixel tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {[0, 25, 50, 75, 100].map((v) => (
            <div
              key={v}
              className={`w-0.5 h-1 ${progress >= v ? "bg-purple-400" : "bg-white/20"}`}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <p className="text-white/50 text-xs text-center animate-pulse tracking-widest uppercase">
        {message}
      </p>

      {/* Pixel card animation */}
      <div className="mt-14 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-9 h-12 border border-white/20 bg-surface-2 overflow-hidden animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {/* mini checkerboard */}
            <svg width="100%" height="100%" viewBox="0 0 36 48">
              <pattern id={`p${i}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#0e0e1a"/>
                <rect width="3" height="3" fill="#c084fc" opacity="0.5"/>
                <rect x="3" y="3" width="3" height="3" fill="#c084fc" opacity="0.5"/>
              </pattern>
              <rect width="36" height="48" fill={`url(#p${i})`}/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
