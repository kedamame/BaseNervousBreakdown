"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameState } from "@/lib/types";
import { getGridCols, getCardSize } from "@/lib/gameLogic";
import { Card } from "./Card";

interface GameBoardProps {
  gameState: GameState;
  onFlipCard: (cardId: string) => void;
  onCheckMatch: () => void;
}

const DISPLAY_MS = 700;

export function GameBoard({ gameState, onFlipCard, onCheckMatch }: GameBoardProps) {
  const { cards, flippedCards, status, stage } = gameState;

  // Preload all card images before allowing interaction
  const [allImagesPreloaded, setAllImagesPreloaded] = useState(false);
  const preloadStageRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "playing" || cards.length === 0) return;
    // Already preloaded for this stage
    if (preloadStageRef.current === stage) return;

    preloadStageRef.current = stage;
    setAllImagesPreloaded(false);

    // Deduplicate URLs (matched pairs share the same image)
    const seen = new Set<string>();
    const urls = cards.map((c) => c.image.imageUrl).filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
    let remaining = urls.length;
    let cancelled = false;

    const onDone = () => {
      if (cancelled) return;
      remaining--;
      if (remaining <= 0) setAllImagesPreloaded(true);
    };

    urls.forEach((url) => {
      // Local / data-URL images are available immediately
      if (url.startsWith("/") || url.startsWith("data:")) {
        onDone();
        return;
      }
      const img = new window.Image();
      img.onload = onDone;
      img.onerror = onDone; // treat errors as "done" so we don't block forever
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stage]); // stage changes on NEXT_STAGE; initial start changes status→"playing"

  // Simple display timer — images are guaranteed preloaded by the time player can flip
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (flippedCards.length !== 2) return;
    checkTimeoutRef.current = setTimeout(onCheckMatch, DISPLAY_MS);
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [flippedCards, onCheckMatch]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (status !== "playing" || !allImagesPreloaded) return;
      if (flippedCards.length >= 2) return;
      onFlipCard(cardId);
    },
    [status, allImagesPreloaded, flippedCards.length, onFlipCard]
  );

  const cardCount = cards.length;
  const gridCols = getGridCols(cardCount);
  const cardSize = getCardSize(cardCount);
  const isDisabled =
    !allImagesPreloaded || flippedCards.length >= 2 || status !== "playing";

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto voxel-grid relative">
      {/* Preload overlay — shown until all images are ready */}
      {status === "playing" && !allImagesPreloaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 gap-3">
          <span className="animate-spin text-purple-400 text-3xl">⟳</span>
          <span className="text-white/50 text-xs font-mono uppercase tracking-widest">
            画像を読み込み中...
          </span>
        </div>
      )}

      <div
        className={`grid ${gridCols} gap-2`}
        style={{ maxWidth: "100%", maxHeight: "calc(100vh - 160px)" }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            size={cardSize}
            onClick={handleCardClick}
            disabled={isDisabled && card.state === "hidden"}
          />
        ))}
      </div>
    </div>
  );
}
