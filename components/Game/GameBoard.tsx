"use client";

import { useCallback, useEffect, useRef } from "react";
import { GameCard as GameCardType, GameState } from "@/lib/types";
import { getGridCols, getCardSize } from "@/lib/gameLogic";
import { Card } from "./Card";

interface GameBoardProps {
  gameState: GameState;
  onFlipCard: (cardId: string) => void;
  onCheckMatch: () => void;
}

export function GameBoard({ gameState, onFlipCard, onCheckMatch }: GameBoardProps) {
  const { cards, flippedCards, status } = gameState;
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (status !== "playing") return;
      if (flippedCards.length >= 2) return;
      onFlipCard(cardId);
    },
    [status, flippedCards.length, onFlipCard]
  );

  // Auto-check for match when 2 cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      checkTimeoutRef.current = setTimeout(() => {
        onCheckMatch();
      }, 700);
    }
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [flippedCards.length, onCheckMatch]);

  const cardCount = cards.length;
  const gridCols = getGridCols(cardCount);
  const cardSize = getCardSize(cardCount);
  const isDisabled = flippedCards.length >= 2 || status !== "playing";

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
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
