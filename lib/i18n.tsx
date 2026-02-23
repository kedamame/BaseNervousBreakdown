"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "ja";

const en = {
  game: {
    title: "Base Memory",
    subtitle: "Memory Card Game on Base",
  },
  loading: {
    connectingWallet: "Connecting wallet...",
    loading: "Loading...",
    checkingWallet: "Checking wallet...",
    loadingNFTs: "Loading NFTs...",
    loadingTokens: (n: number) => `${n} NFTs found. Loading tokens...`,
    preparingCards: "Preparing cards...",
    loadedImages: (n: number) => `${n} images loaded`,
    preparingStage: (n: number) => `Preparing Stage ${n}...`,
  },
  walletConnect: {
    title: "Connect Wallet",
    subtitle: "Connect your wallet to start playing",
    farcaster: "Farcaster Wallet",
    injected: "MetaMask / Browser Wallet",
    coinbase: "Coinbase Wallet",
    connecting: "Connecting...",
    detected: "Detected",
    connected: "Connected",
    startGame: "Start Game",
    switchWallet: "Switch Wallet",
  },
  scoreboard: {
    stage: "Stage",
    moves: "Moves",
    pairsOf: (m: number, t: number) => `${m} / ${t} Pairs`,
    hp: "HP",
    combo: (n: number) => `COMBO ×${n}`,
  },
  gameOver: {
    title: "Game Over",
    stageReached: (n: number) => `Stage ${n} Reached`,
    totalMoves: (n: number) => `${n} Total Moves`,
    sendingTx: "Submitting score...",
    confirmingTx: "Confirming on Base...",
    recorded: "✓ Score recorded on Base",
    offline: "~ Offline mode",
    failed: "⚠ Score recording failed",
    recordScore: "Record Score on Base",
    restart: "Restart",
  },
  stageComplete: {
    cleared: (n: number) => `Stage ${n} Clear!`,
    nextStageHint: "Head to the next stage",
    pairsLabel: "Pairs",
    pairsValue: (n: number) => `${n} pairs`,
    movesLabel: "Moves",
    movesValue: (n: number) => `${n} moves`,
    efficiency: "Efficiency",
    sendingTx: "Submitting transaction...",
    confirmingTx: "Confirming on Base...",
    recorded: "✓ Score recorded on Base",
    offline: "~ Offline mode (no score recording)",
    failed: "⚠ Score recording failed",
    nextButton: (n: number) => `Stage ${n} →`,
    recordingButton: "Recording...",
  },
};

const ja: typeof en = {
  game: {
    title: "Base神経衰弱",
    subtitle: "Baseチェーンでプレイする神経衰弱",
  },
  loading: {
    connectingWallet: "ウォレットに接続中...",
    loading: "読み込み中...",
    checkingWallet: "ウォレットを確認中...",
    loadingNFTs: "NFTを読み込み中...",
    loadingTokens: (n: number) => `${n}件のNFTを発見。トークンを確認中...`,
    preparingCards: "カードを準備中...",
    loadedImages: (n: number) => `${n}枚の画像を読み込みました`,
    preparingStage: (n: number) => `Stage ${n} を準備中...`,
  },
  walletConnect: {
    title: "ウォレットを接続",
    subtitle: "ウォレットを接続してゲームを開始",
    farcaster: "Farcasterウォレット",
    injected: "MetaMask / ブラウザウォレット",
    coinbase: "Coinbase Wallet",
    connecting: "接続中...",
    detected: "検出済み",
    connected: "接続済み",
    startGame: "ゲームスタート",
    switchWallet: "ウォレットを切替",
  },
  scoreboard: {
    stage: "Stage",
    moves: "手数",
    pairsOf: (m: number, t: number) => `${m} / ${t} ペア`,
    hp: "体力",
    combo: (n: number) => `コンボ ×${n}`,
  },
  gameOver: {
    title: "ゲームオーバー",
    stageReached: (n: number) => `Stage ${n} 到達`,
    totalMoves: (n: number) => `${n} 手`,
    sendingTx: "スコアを送信中...",
    confirmingTx: "Baseで確認中...",
    recorded: "✓ スコアをBaseに記録しました",
    offline: "～ オフラインモード",
    failed: "⚠ スコアの記録に失敗",
    recordScore: "スコアをBaseに記録",
    restart: "リスタート",
  },
  stageComplete: {
    cleared: (n: number) => `Stage ${n} クリア！`,
    nextStageHint: "次のステージへ進もう",
    pairsLabel: "ペア数",
    pairsValue: (n: number) => `${n} ペア`,
    movesLabel: "手数",
    movesValue: (n: number) => `${n} 手`,
    efficiency: "効率",
    sendingTx: "トランザクションを送信中...",
    confirmingTx: "Baseで確認中...",
    recorded: "✓ スコアをBaseに記録しました",
    offline: "～ オフラインモード（スコア記録なし）",
    failed: "⚠ スコアの記録に失敗",
    nextButton: (n: number) => `Stage ${n} へ →`,
    recordingButton: "記録中...",
  },
};

export const translations = { en, ja } as const;
export type Translations = typeof en;

// ─── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage on client
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "en" || saved === "ja") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useT() {
  return useContext(I18nContext);
}
