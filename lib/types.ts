export interface AssetImage {
  id: string;
  imageUrl: string;
  name: string;
  type: "nft" | "token" | "demo" | "heart";
  contractAddress?: string;
  tokenId?: string;
}

export interface GameCard {
  id: string;
  pairId: string;
  image: AssetImage;
  state: "hidden" | "flipped" | "matched";
  position: number;
}

export type GameStatus =
  | "loading"
  | "ready"
  | "playing"
  | "stage_complete"
  | "recording"
  | "error"
  | "game_over";

export interface GameState {
  status: GameStatus;
  stage: number;
  cards: GameCard[];
  flippedCards: string[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  totalMoves: number;
  loadingProgress: number;
  loadingMessage: string;
  hp: number;
  maxHp: number;
  consecutiveMisses: number;
}

export interface StageConfig {
  stage: number;
  totalCards: number;
  pairsNeeded: number;
}

export interface ScoreRecord {
  stage: number;
  moves: number;
  timestamp: bigint;
}
