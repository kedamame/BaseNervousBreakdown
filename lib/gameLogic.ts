import { AssetImage, GameCard, StageConfig } from "./types";

/**
 * Returns total card count for a given stage.
 * Always stage * 4: Stage 1=4, Stage 2=8, Stage 3=12, ...
 */
export function getCardCount(stage: number): number {
  return stage * 4;
}

export function getStageConfig(stage: number): StageConfig {
  const totalCards = getCardCount(stage);
  return {
    stage,
    totalCards,
    pairsNeeded: totalCards / 2,
  };
}

/**
 * Fisher-Yates shuffle.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Heart card image — restores HP when matched.
 */
export const HEART_IMAGE: AssetImage = {
  id: "heart",
  imageUrl: "/heart.svg",
  name: "Heart",
  type: "heart",
};

/**
 * Creates a shuffled deck of GameCards.
 * Injects 1 heart pair per 8 cards (floor(totalCards / 8)).
 */
export function createDeck(
  images: AssetImage[],
  pairsNeeded: number,
  totalCards: number
): GameCard[] {
  const heartCount = Math.floor(totalCards / 8);
  const regularCount = pairsNeeded - heartCount;
  const selected = images.slice(0, regularCount);
  const cards: GameCard[] = [];

  // Regular pairs
  selected.forEach((image, index) => {
    const pairId = `pair-${index}`;
    cards.push(
      { id: `${pairId}-a`, pairId, image, state: "hidden", position: 0 },
      { id: `${pairId}-b`, pairId, image, state: "hidden", position: 0 }
    );
  });

  // Heart pairs
  for (let h = 0; h < heartCount; h++) {
    const pairId = `heart-${h}`;
    cards.push(
      { id: `${pairId}-a`, pairId, image: HEART_IMAGE, state: "hidden", position: 0 },
      { id: `${pairId}-b`, pairId, image: HEART_IMAGE, state: "hidden", position: 0 }
    );
  }

  const shuffled = shuffle(cards);
  return shuffled.map((card, i) => ({ ...card, position: i }));
}

/**
 * Returns the CSS grid columns for a given card count.
 */
export function getGridCols(cardCount: number): string {
  if (cardCount <= 4) return "grid-cols-2";
  if (cardCount <= 8) return "grid-cols-4";
  if (cardCount <= 16) return "grid-cols-4";
  if (cardCount <= 24) return "grid-cols-6";
  if (cardCount <= 32) return "grid-cols-8";
  return "grid-cols-8";
}

/**
 * Returns the card size class based on card count.
 */
export function getCardSize(cardCount: number): string {
  if (cardCount <= 4) return "w-28 h-28";
  if (cardCount <= 8) return "w-20 h-20";
  if (cardCount <= 16) return "w-16 h-16";
  if (cardCount <= 24) return "w-14 h-14";
  return "w-12 h-12";
}
