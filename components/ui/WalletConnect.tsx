"use client";

import { useConnect, useConnectors } from "wagmi";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

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

export function WalletConnect() {
  const { t } = useT();
  const { connect, isPending, variables } = useConnect();
  const connectors = useConnectors();

  // Filter out farcasterMiniApp in browser context (it won't work outside Farcaster)
  // We detect if we're likely in Farcaster by checking the parent window
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

      {/* Connect card */}
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
    </div>
  );
}
