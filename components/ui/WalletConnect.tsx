"use client";

import { useState } from "react";
import { useConnect, useConnectors, useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

interface WalletConnectProps {
  onStart?: () => void;
}

// Map connector IDs to display info
function getConnectorInfo(id: string, name: string, t: ReturnType<typeof useT>["t"]) {
  if (id === "farcasterMiniApp" || name.toLowerCase().includes("farcaster")) {
    return { label: t.walletConnect.farcaster, icon: "■" };
  }
  if (id === "coinbaseWallet" || name.toLowerCase().includes("coinbase")) {
    return { label: t.walletConnect.coinbase, icon: "■" };
  }
  if (id === "injected" || name.toLowerCase().includes("metamask")) {
    return { label: t.walletConnect.injected, icon: "■" };
  }
  return { label: name, icon: "■" };
}

export function WalletConnect({ onStart }: WalletConnectProps) {
  const { t } = useT();
  const { connect, isPending, variables } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const connectors = useConnectors();
  const { isConnected, address, connector } = useAccount();
  const chainId = useChainId();

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const isOnBase = chainId === base.id;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const handleSwitchToBase = async () => {
    setSwitchError(null);
    setIsSwitching(true);
    try {
      // Primary: use wagmi to switch via the connected connector
      try {
        await switchChainAsync({ chainId: base.id });
        return;
      } catch (originalErr) {
        // window.ethereum fallback is only safe for injected connectors
        // (Rabby/MetaMask), where window.ethereum IS the connected wallet.
        if (connector?.type !== "injected") throw originalErr;
      }

      // Fallback for injected wallets: window.ethereum direct call
      const provider = typeof window !== "undefined"
        ? (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
        : null;

      if (!provider) {
        throw new Error("No compatible wallet provider to switch chains");
      }
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base Mainnet = 8453
        });
      } catch (err) {
        // 4902 = chain not added to wallet (== handles both number and string "4902")
        if ((err as { code?: number | string }).code == 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            }],
          });
          // Explicitly switch after adding (some wallets don't auto-switch)
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.split("\n")[0] : "Failed to switch network";
      setSwitchError(msg);
    } finally {
      setIsSwitching(false);
    }
  };

  // Filter out farcasterMiniApp in browser context (it won't work outside Farcaster)
  const isInFarcaster =
    typeof window !== "undefined" && window.self !== window.top;

  const visibleConnectors = connectors.filter((c) => {
    if (c.id === "farcasterMiniApp") return isInFarcaster;
    return true;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 relative font-mono voxel-grid">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl font-black text-white mb-3 select-none">▣</div>
        <h1 className="text-2xl font-black text-white tracking-widest uppercase">
          Base<span className="text-purple-400"> Memory</span>
        </h1>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">{t.game.subtitle}</p>
      </div>

      {isConnected && onStart ? (
        /* ── Connected state ── */
        <div className="w-full max-w-xs bg-surface-2 border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-purple-400 text-sm">✓</span>
            <span className="text-white/50 text-xs uppercase tracking-widest">
              {t.walletConnect.connected}
            </span>
          </div>

          {/* Address display */}
          <div className="bg-surface border border-white/10 px-4 py-2 mb-5 text-sm text-white/70 text-center tracking-wider">
            {shortAddress}
          </div>

          {!isOnBase ? (
            /* ── Wrong network: show Switch to Base ── */
            <>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-yellow-400 text-sm">⚠</span>
                <span className="text-yellow-400 text-xs uppercase tracking-widest">
                  {t.walletConnect.wrongNetwork}
                </span>
              </div>

              {switchError && (
                <p className="text-red-400 text-xs mb-3 break-all leading-relaxed">
                  {switchError.length > 80 ? switchError.slice(0, 80) + "…" : switchError}
                </p>
              )}

              <button
                onClick={handleSwitchToBase}
                disabled={isSwitching}
                className="w-full py-4 bg-yellow-500/10 border border-yellow-500/60 text-yellow-400
                  font-black text-base uppercase tracking-widest
                  hover:bg-yellow-500/20 hover:border-yellow-400 active:scale-95
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {isSwitching ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span>
                    {t.walletConnect.switchToBase}
                  </span>
                ) : (
                  t.walletConnect.switchToBase
                )}
              </button>

              <button
                onClick={() => disconnect()}
                className="w-full py-3 bg-surface border border-white/15 text-white/40
                  font-black text-xs uppercase tracking-widest
                  hover:border-white/30 hover:text-white/60 active:scale-95 transition-all"
              >
                {t.walletConnect.switchWallet}
              </button>
            </>
          ) : (
            /* ── On Base: Start Game ── */
            <>
              <button
                onClick={onStart}
                className="w-full py-4 bg-purple-500/20 border border-purple-500/60 text-purple-400
                  font-black text-base uppercase tracking-widest
                  hover:bg-purple-500/30 hover:border-purple-400 active:scale-95 transition-all mb-3"
              >
                {t.walletConnect.startGame}
              </button>

              <button
                onClick={() => disconnect()}
                className="w-full py-3 bg-surface border border-white/15 text-white/40
                  font-black text-xs uppercase tracking-widest
                  hover:border-white/30 hover:text-white/60 active:scale-95 transition-all"
              >
                {t.walletConnect.switchWallet}
              </button>
            </>
          )}
        </div>
      ) : (
        /* ── Not connected: wallet selection ── */
        <div className="w-full max-w-xs bg-surface-2 border border-white/10 p-6">
          <h2 className="text-white font-black text-base mb-1 text-center uppercase tracking-widest">
            {t.walletConnect.title}
          </h2>
          <p className="text-white/40 text-xs text-center mb-5 tracking-widest uppercase">
            {t.walletConnect.subtitle}
          </p>

          <div className="flex flex-col gap-3">
            {visibleConnectors.map((connector) => {
              const { label, icon } = getConnectorInfo(connector.id, connector.name, t);
              const isConnecting =
                isPending && variables?.connector === connector;

              return (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="flex items-center gap-3 w-full px-4 py-3
                    bg-surface border border-white/15 text-white text-xs font-black uppercase tracking-widest
                    hover:border-purple-500/60 hover:bg-surface-2 active:scale-95
                    transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-base">{icon}</span>
                  <span className="flex-1 text-left">{label}</span>
                  {isConnecting ? (
                    <span className="animate-spin text-purple-400">⟳</span>
                  ) : connector.id === "injected" && typeof window !== "undefined" && (window as Window & { ethereum?: unknown }).ethereum ? (
                    <span className="text-[10px] text-purple-400 border border-purple-500/50 px-2 py-0.5">
                      {t.walletConnect.detected}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
