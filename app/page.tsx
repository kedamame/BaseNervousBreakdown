"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAccount, useConnect } from "wagmi";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { sdk } from "@farcaster/miniapp-sdk";
import { useGame } from "@/hooks/useGame";
import { useAlchemy } from "@/hooks/useAlchemy";
import { useScore } from "@/hooks/useScore";
import { LoadingScreen } from "@/components/Game/LoadingScreen";
import { GameBoard } from "@/components/Game/GameBoard";
import { StageComplete } from "@/components/Game/StageComplete";
import { ScoreBoard } from "@/components/ui/ScoreBoard";
import { getStageConfig } from "@/lib/gameLogic";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const {
    state: gameState,
    startStage,
    flipCard,
    checkMatch,
    startRecording,
    nextStage,
  } = useGame();

  const { state: alchemyState, loadAssetsForStage, prefetchForNextStage, getImages } =
    useAlchemy();

  const { recordScore, status: scoreStatus, error: recordError, reset: resetScore } =
    useScore();

  const hasInitialized = useRef(false);

  // Initialize Farcaster SDK and connect wallet
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      // Connect wallet via Farcaster MiniApp connector
      connect({ connector: farcasterMiniApp() });
      // Signal Farcaster to hide splash screen
      await sdk.actions.ready();
    };

    init();
  }, [connect]);

  // Start Stage 1 once wallet is connected
  const hasStartedGame = useRef(false);
  useEffect(() => {
    if (!isConnected || !address || hasStartedGame.current) return;
    hasStartedGame.current = true;
    beginStage(1, address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const beginStage = useCallback(
    async (stage: number, walletAddress: string) => {
      const config = getStageConfig(stage);

      // Load assets needed for this stage (use cached if available)
      const images = await loadAssetsForStage(walletAddress, config.pairsNeeded);
      startStage(stage, images);

      // Background-prefetch for the next stage
      const nextConfig = getStageConfig(stage + 1);
      prefetchForNextStage(walletAddress, nextConfig.pairsNeeded);
    },
    [loadAssetsForStage, startStage, prefetchForNextStage]
  );

  // Handle stage complete: record score then show next stage button
  const handleStageComplete = useCallback(async () => {
    startRecording();
    await recordScore(gameState.stage, gameState.moves);
  }, [startRecording, recordScore, gameState.stage, gameState.moves]);

  useEffect(() => {
    if (gameState.status === "stage_complete") {
      handleStageComplete();
    }
  }, [gameState.status, handleStageComplete]);

  const handleNextStage = useCallback(() => {
    resetScore();
    const nextImages = getImages();
    nextStage(nextImages);

    // If still loading more assets, prefetch again
    if (address) {
      const config = getStageConfig(gameState.stage + 2);
      prefetchForNextStage(address, config.pairsNeeded);
    }
  }, [resetScore, getImages, nextStage, address, gameState.stage, prefetchForNextStage]);

  // If wallet not yet connected, show loading
  if (!isConnected || gameState.status === "loading") {
    return (
      <LoadingScreen
        progress={alchemyState.progress}
        message={
          !isConnected
            ? "ウォレットに接続中..."
            : alchemyState.message || "読み込み中..."
        }
        stage={gameState.stage}
      />
    );
  }

  if (gameState.status === "stage_complete" || gameState.status === "recording") {
    return (
      <StageComplete
        stage={gameState.stage}
        moves={gameState.moves}
        totalPairs={gameState.totalPairs}
        scoreStatus={scoreStatus}
        recordError={recordError}
        onNextStage={handleNextStage}
      />
    );
  }

  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      <ScoreBoard
        stage={gameState.stage}
        moves={gameState.moves}
        matchedPairs={gameState.matchedPairs}
        totalPairs={gameState.totalPairs}
      />
      <GameBoard
        gameState={gameState}
        onFlipCard={flipCard}
        onCheckMatch={checkMatch}
      />
    </main>
  );
}
