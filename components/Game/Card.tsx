"use client";

import Image from "next/image";
import { GameCard as GameCardType } from "@/lib/types";

interface CardProps {
  card: GameCardType;
  size: string;
  onClick: (id: string) => void;
  disabled: boolean;
}

export function Card({ card, size, onClick, disabled }: CardProps) {
  const isFlipped = card.state === "flipped" || card.state === "matched";
  const isMatched = card.state === "matched";

  const handleClick = () => {
    if (disabled || isFlipped) return;
    onClick(card.id);
  };

  return (
    <div
      className={`relative cursor-pointer select-none ${size}`}
      style={{ perspective: "600px" }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-300"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card Back */}
        <div
          className={`
            absolute inset-0 rounded-lg border-2 flex items-center justify-center
            ${isMatched ? "border-purple-500 bg-purple-900/30" : "border-border bg-surface-2"}
            transition-colors duration-300
          `}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Card back pattern */}
          <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
            <div
              className="w-3/4 h-3/4 rounded"
              style={{
                background:
                  "linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #1a1a2e 100%)",
                backgroundSize: "200% 200%",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-purple-300 text-lg opacity-60">⬡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`
            absolute inset-0 rounded-lg border-2 overflow-hidden
            ${isMatched ? "border-purple-400 ring-2 ring-purple-500/50" : "border-purple-700"}
          `}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {card.image.imageUrl.startsWith("/") ||
          card.image.imageUrl.startsWith("data:") ? (
            // SVG / local images
            <img
              src={card.image.imageUrl}
              alt={card.image.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={card.image.imageUrl}
              alt={card.image.name}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/demo-cards/card-1.svg";
              }}
            />
          )}

          {/* Matched overlay */}
          {isMatched && (
            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
