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
import { GameOver } from "@/components/Game/GameOver";
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

  // Game over: submit score once (only when HP reaches 0)
  const hasRecordedGameOver = useRef(false);
  useEffect(() => {
    if (gameState.status === "game_over" && !hasRecordedGameOver.current) {
      hasRecordedGameOver.current = true;
      const finalMoves = gameState.totalMoves + gameState.moves;
      recordScore(gameState.stage, finalMoves);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status]);

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

  // Game over screen
  if (gameState.status === "game_over") {
    return (
      <GameOver
        stage={gameState.stage}
        totalMoves={gameState.totalMoves + gameState.moves}
        scoreStatus={scoreStatus}
        recordError={recordError}
      />
    );
  }

  // Stage complete screen (no transaction — HP carries over)
  if (gameState.status === "stage_complete") {
    return (
      <StageComplete
        stage={gameState.stage}
        moves={gameState.moves}
        totalPairs={gameState.totalPairs}
        scoreStatus={scoreStatus}
        recordError={recordError}
        onNextStage={handleNextStage}
        hp={gameState.hp}
        maxHp={gameState.maxHp}
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
        hp={gameState.hp}
        maxHp={gameState.maxHp}
        consecutiveMisses={gameState.consecutiveMisses}
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
