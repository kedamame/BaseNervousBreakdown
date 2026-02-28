"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GameCard as GameCardType } from "@/lib/types";

interface CardProps {
  card: GameCardType;
  size: string;
  onClick: (id: string) => void;
  disabled: boolean;
  onImageLoad?: (cardId: string) => void;
}

export function Card({ card, size, onClick, disabled, onImageLoad }: CardProps) {
  const isFlipped = card.state === "flipped" || card.state === "matched";
  const isMatched = card.state === "matched";
  const isHeart = card.image.type === "heart";
  const isLocal =
    card.image.imageUrl.startsWith("/") || card.image.imageUrl.startsWith("data:");

  // Track whether the face-up image has finished loading
  const [imageLoaded, setImageLoaded] = useState(false);

  // Local / data-URL images are immediately available once the element renders
  useEffect(() => {
    if (isFlipped && isLocal && !imageLoaded) {
      setImageLoaded(true);
      onImageLoad?.(card.id);
    }
  }, [isFlipped, isLocal, imageLoaded, card.id, onImageLoad]);

  const handleLoad = () => {
    if (!imageLoaded) {
      setImageLoaded(true);
      onImageLoad?.(card.id);
    }
  };

  const handleError = () => {
    // Even on error, unblock the match timer
    if (!imageLoaded) {
      setImageLoaded(true);
      onImageLoad?.(card.id);
    }
  };

  const handleClick = () => {
    if (disabled || isFlipped) return;
    onClick(card.id);
  };

  // Reset load state when card is hidden again (new stage reuses same component)
  useEffect(() => {
    if (!isFlipped) setImageLoaded(false);
  }, [isFlipped]);

  const showLoadingOverlay = isFlipped && !isMatched && !imageLoaded && !isLocal;

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
        {/* Card Back — pixel checkerboard voxel texture */}
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
          {isLocal ? (
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
              onLoad={handleLoad}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/demo-cards/card-1.svg";
                handleError();
              }}
            />
          )}

          {/* Loading spinner — shown while image is still fetching */}
          {showLoadingOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="animate-spin text-purple-400 text-xl">⟳</span>
            </div>
          )}

          {/* Matched overlay */}
          {isMatched && (
            <div className={`absolute inset-0 flex items-center justify-center ${isHeart ? "bg-red-500/20" : "bg-purple-500/25"}`}>
              <span className="text-2xl font-mono font-bold text-white drop-shadow-lg">✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
