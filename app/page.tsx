"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { sdk } from "@farcaster/miniapp-sdk";
import { useGame } from "@/hooks/useGame";
import { useAlchemy } from "@/hooks/useAlchemy";
import { useScore } from "@/hooks/useScore";
import { useT } from "@/lib/i18n";
import { LoadingScreen } from "@/components/Game/LoadingScreen";
import { GameBoard } from "@/components/Game/GameBoard";
import { StageComplete } from "@/components/Game/StageComplete";
import { ScoreBoard } from "@/components/ui/ScoreBoard";
import { WalletConnect } from "@/components/ui/WalletConnect";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { getStageConfig } from "@/lib/gameLogic";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { t } = useT();

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

  // Show wallet connect UI if not connected after a short delay
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize Farcaster SDK and attempt auto-connect
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      // Try Farcaster auto-connect first
      connect({ connector: farcasterMiniApp() });
      // Signal Farcaster to hide splash screen regardless
      await sdk.actions.ready();
    };

    init();

    // If still not connected after 2.5s, show wallet selection UI
    const timer = setTimeout(() => {
      if (!isConnected) setShowWalletConnect(true);
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide wallet connect UI once connected
  useEffect(() => {
    if (isConnected) setShowWalletConnect(false);
  }, [isConnected]);

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
      const images = await loadAssetsForStage(walletAddress, config.pairsNeeded);
      startStage(stage, images);

      // Background-prefetch for the next stage
      const nextConfig = getStageConfig(stage + 1);
      prefetchForNextStage(walletAddress, nextConfig.pairsNeeded);
    },
    [loadAssetsForStage, startStage, prefetchForNextStage]
  );

  // Handle stage complete: record score then wait for user to proceed
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

    if (address) {
      const config = getStageConfig(gameState.stage + 2);
      prefetchForNextStage(address, config.pairsNeeded);
    }
  }, [resetScore, getImages, nextStage, address, gameState.stage, prefetchForNextStage]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Wallet connect screen (browser fallback)
  if (showWalletConnect && !isConnected) {
    return <WalletConnect />;
  }

  // Asset loading screen
  if (!isConnected || gameState.status === "loading") {
    return (
      <LoadingScreen
        progress={alchemyState.progress}
        message={
          !isConnected
            ? t.loading.connectingWallet
            : alchemyState.message || t.loading.loading
        }
        stage={gameState.stage}
      />
    );
  }

  // Stage complete / score recording screen
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

  // Main game screen
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
      {/* Language toggle — fixed bottom-right during gameplay */}
      <div className="fixed bottom-3 right-3 z-50">
        <LanguageToggle />
      </div>
    </main>
  );
}
