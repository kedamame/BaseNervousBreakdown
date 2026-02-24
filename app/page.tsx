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
import { Leaderboard } from "@/components/Game/Leaderboard";
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

  const { state: alchemyState, loadAssetsForStage, prefetchForNextStage, getImages, resetImages } =
    useAlchemy();

  const { recordScore, status: scoreStatus, error: recordError, reset: resetScore } =
    useScore();

  // gameStarted: true only after user explicitly clicks "Start Game"
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize Farcaster SDK and attempt auto-connect (Farcaster client only)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      // Try Farcaster auto-connect (no-op in browser)
      connect({ connector: farcasterMiniApp() });
      // Signal Farcaster to hide splash screen
      try { await sdk.actions.ready(); } catch { /* not in Farcaster */ }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset gameStarted if wallet disconnects mid-session
  useEffect(() => {
    if (!isConnected) setGameStarted(false);
  }, [isConnected]);

  const beginStage = useCallback(
    async (stage: number, walletAddress: string) => {
      const config = getStageConfig(stage);
      const images = await loadAssetsForStage(walletAddress, config.pairsNeeded);
      // null means a reset happened mid-flight; a newer load is already in-flight
      if (images === null) return;
      startStage(stage, images);

      // Background-prefetch for the next stage
      const nextConfig = getStageConfig(stage + 1);
      prefetchForNextStage(walletAddress, nextConfig.pairsNeeded);
    },
    [loadAssetsForStage, startStage, prefetchForNextStage]
  );

  const handleStartGame = useCallback(() => {
    if (!address) return;
    resetImages();
    setGameStarted(true);
    beginStage(1, address);
  }, [address, beginStage, resetImages]);

  const handleRecordGameOver = useCallback(() => {
    recordScore(gameState.stage, gameState.totalMoves + gameState.moves);
  }, [recordScore, gameState.stage, gameState.totalMoves, gameState.moves]);

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

  // Leaderboard overlay (accessible from WalletConnect and GameOver screens)
  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  // Wallet connect / Start screen (shown until user explicitly starts)
  if (!gameStarted) {
    return (
      <WalletConnect
        onStart={isConnected && address ? handleStartGame : undefined}
        onLeaderboard={() => setShowLeaderboard(true)}
      />
    );
  }

  // Asset loading screen (after Start is pressed)
  if (gameState.status === "loading") {
    return (
      <LoadingScreen
        progress={alchemyState.progress}
        message={alchemyState.message || t.loading.loading}
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
        onRecordScore={handleRecordGameOver}
        onLeaderboard={() => setShowLeaderboard(true)}
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
