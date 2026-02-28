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
  const isHeart = card.image.type === "heart";

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
          className="absolute inset-0 overflow-hidden border border-white/20 hover:border-white/50 transition-colors"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src="/card-back.svg"
            alt="Card back"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 overflow-hidden border ${
            isMatched && isHeart
              ? "border-pink-300 heart-glow"
              : isMatched
              ? "border-purple-400 pixel-glow"
              : isHeart
              ? "border-pink-400/80"
              : "border-white/30"
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {card.image.imageUrl.startsWith("/") ||
          card.image.imageUrl.startsWith("data:") ? (
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
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isHeart ? "bg-red-500/20" : "bg-purple-500/25"
              }`}
            >
              <span className="text-2xl font-mono font-bold text-white drop-shadow-lg">
                ✓
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
