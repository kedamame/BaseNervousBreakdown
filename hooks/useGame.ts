"use client";

import { useCallback, useReducer } from "react";
import { AssetImage, GameCard, GameState } from "@/lib/types";
import { createDeck, getStageConfig } from "@/lib/gameLogic";

type GameAction =
  | { type: "START_LOADING" }
  | { type: "SET_LOADING_PROGRESS"; progress: number; message: string }
  | { type: "START_STAGE"; stage: number; images: AssetImage[] }
  | { type: "FLIP_CARD"; cardId: string }
  | { type: "CHECK_MATCH" }
  | { type: "STAGE_COMPLETE" }
  | { type: "START_RECORDING" }
  | { type: "NEXT_STAGE"; images: AssetImage[] }
  | { type: "SET_ERROR"; message: string };

const initialState: GameState = {
  status: "loading",
  stage: 1,
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  loadingProgress: 0,
  loadingMessage: "読み込み中...",
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, status: "loading", loadingProgress: 0 };

    case "SET_LOADING_PROGRESS":
      return {
        ...state,
        loadingProgress: action.progress,
        loadingMessage: action.message,
      };

    case "START_STAGE": {
      const config = getStageConfig(action.stage);
      const deck = createDeck(action.images, config.pairsNeeded);
      return {
        ...state,
        status: "playing",
        stage: action.stage,
        cards: deck,
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: config.pairsNeeded,
        moves: 0,
        loadingProgress: 100,
        loadingMessage: "",
      };
    }

    case "FLIP_CARD": {
      if (state.status !== "playing") return state;
      if (state.flippedCards.length >= 2) return state;

      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card || card.state !== "hidden") return state;

      const updatedCards = state.cards.map((c) =>
        c.id === action.cardId ? { ...c, state: "flipped" as const } : c
      );
      const newFlipped = [...state.flippedCards, action.cardId];

      return { ...state, cards: updatedCards, flippedCards: newFlipped };
    }

    case "CHECK_MATCH": {
      if (state.flippedCards.length !== 2) return state;

      const [idA, idB] = state.flippedCards;
      const cardA = state.cards.find((c) => c.id === idA)!;
      const cardB = state.cards.find((c) => c.id === idB)!;
      const isMatch = cardA.pairId === cardB.pairId;

      const updatedCards = state.cards.map((c) => {
        if (c.id === idA || c.id === idB) {
          return { ...c, state: isMatch ? ("matched" as const) : ("hidden" as const) };
        }
        return c;
      });

      const newMatchedPairs = state.matchedPairs + (isMatch ? 1 : 0);
      const newMoves = state.moves + 1;
      const allMatched = newMatchedPairs === state.totalPairs;

      return {
        ...state,
        cards: updatedCards,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: newMoves,
        status: allMatched ? "stage_complete" : "playing",
      };
    }

    case "STAGE_COMPLETE":
      return { ...state, status: "stage_complete" };

    case "START_RECORDING":
      return { ...state, status: "recording" };

    case "NEXT_STAGE": {
      const nextStage = state.stage + 1;
      const config = getStageConfig(nextStage);
      const deck = createDeck(action.images, config.pairsNeeded);
      return {
        ...state,
        status: "playing",
        stage: nextStage,
        cards: deck,
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: config.pairsNeeded,
        moves: 0,
      };
    }

    case "SET_ERROR":
      return { ...state, status: "error", loadingMessage: action.message };

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startStage = useCallback(
    (stage: number, images: AssetImage[]) => {
      dispatch({ type: "START_STAGE", stage, images });
    },
    []
  );

  const flipCard = useCallback((cardId: string) => {
    dispatch({ type: "FLIP_CARD", cardId });
  }, []);

  const checkMatch = useCallback(() => {
    dispatch({ type: "CHECK_MATCH" });
  }, []);

  const startRecording = useCallback(() => {
    dispatch({ type: "START_RECORDING" });
  }, []);

  const nextStage = useCallback((images: AssetImage[]) => {
    dispatch({ type: "NEXT_STAGE", images });
  }, []);

  const setLoadingProgress = useCallback(
    (progress: number, message: string) => {
      dispatch({ type: "SET_LOADING_PROGRESS", progress, message });
    },
    []
  );

  const setError = useCallback((message: string) => {
    dispatch({ type: "SET_ERROR", message });
  }, []);

  return {
    state,
    startStage,
    flipCard,
    checkMatch,
    startRecording,
    nextStage,
    setLoadingProgress,
    setError,
  };
}
