"use client";

import { useCallback, useEffect, useRef } from "react";
import { GameState } from "@/lib/types";
import { getGridCols, getCardSize } from "@/lib/gameLogic";
import { Card } from "./Card";

interface GameBoardProps {
  gameState: GameState;
  onFlipCard: (cardId: string) => void;
  onCheckMatch: () => void;
}

// How long to display both face-up cards after images are loaded
const DISPLAY_MS = 700;
// Maximum time to wait for images before forcing a check (safety net)
const IMAGE_LOAD_TIMEOUT_MS = 3000;

export function GameBoard({ gameState, onFlipCard, onCheckMatch }: GameBoardProps) {
  const { cards, flippedCards, status, stage } = gameState;

  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set of card IDs whose face-up images have finished loading this stage
  const loadedCardIds = useRef<Set<string>>(new Set());
  // The two card IDs waiting for images to load before the timer fires
  const pendingFlippedRef = useRef<string[]>([]);
  const pendingCheckRef = useRef(false);

  // Clear loaded-image tracking when a new stage begins
  useEffect(() => {
    loadedCardIds.current.clear();
    pendingFlippedRef.current = [];
    pendingCheckRef.current = false;
  }, [stage]);

  const clearCheckTimeout = () => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  };

  /** Start the DISPLAY_MS display timer then fire onCheckMatch */
  const scheduleCheck = useCallback(() => {
    clearCheckTimeout();
    checkTimeoutRef.current = setTimeout(() => {
      pendingCheckRef.current = false;
      pendingFlippedRef.current = [];
      onCheckMatch();
    }, DISPLAY_MS);
  }, [onCheckMatch]);

  /**
   * Called by Card when its face-up image finishes loading.
   * If both flipped cards are now loaded, start the display timer.
   */
  const handleImageLoad = useCallback(
    (cardId: string) => {
      loadedCardIds.current.add(cardId);

      if (!pendingCheckRef.current) return;
      const [id1, id2] = pendingFlippedRef.current;
      if (!id1 || !id2) return;

      if (
        loadedCardIds.current.has(id1) &&
        loadedCardIds.current.has(id2)
      ) {
        // Both images ready → cancel safety timeout, start display timer
        pendingCheckRef.current = false;
        scheduleCheck();
      }
    },
    [scheduleCheck]
  );

  // When 2 cards are flipped, wait for images then start display timer
  useEffect(() => {
    if (flippedCards.length !== 2) {
      if (flippedCards.length === 0) {
        pendingCheckRef.current = false;
        pendingFlippedRef.current = [];
      }
      return;
    }

    const [id1, id2] = flippedCards;
    pendingFlippedRef.current = [id1, id2];

    if (
      loadedCardIds.current.has(id1) &&
      loadedCardIds.current.has(id2)
    ) {
      // Both images already loaded (cached) → start timer immediately
      pendingCheckRef.current = false;
      scheduleCheck();
    } else {
      // At least one image is still loading → wait
      pendingCheckRef.current = true;

      // Safety net: force check after IMAGE_LOAD_TIMEOUT_MS regardless
      clearCheckTimeout();
      checkTimeoutRef.current = setTimeout(() => {
        pendingCheckRef.current = false;
        pendingFlippedRef.current = [];
        onCheckMatch();
      }, IMAGE_LOAD_TIMEOUT_MS);
    }

    return () => clearCheckTimeout();
  }, [flippedCards, scheduleCheck, onCheckMatch]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (status !== "playing") return;
      if (flippedCards.length >= 2) return;
      onFlipCard(cardId);
    },
    [status, flippedCards.length, onFlipCard]
  );

  const cardCount = cards.length;
  const gridCols = getGridCols(cardCount);
  const cardSize = getCardSize(cardCount);
  const isDisabled = flippedCards.length >= 2 || status !== "playing";

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto voxel-grid">
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
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
}
