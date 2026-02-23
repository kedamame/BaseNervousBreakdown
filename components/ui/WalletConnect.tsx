"use client";

import { useConnect, useConnectors } from "wagmi";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

// Map connector IDs to display info
function getConnectorInfo(id: string, name: string, t: ReturnType<typeof useT>["t"]) {
  if (id === "farcasterMiniApp" || name.toLowerCase().includes("farcaster")) {
    return { label: t.walletConnect.farcaster, icon: "🟣" };
  }
  if (id === "coinbaseWallet" || name.toLowerCase().includes("coinbase")) {
    return { label: t.walletConnect.coinbase, icon: "🔵" };
  }
  if (id === "injected" || name.toLowerCase().includes("metamask")) {
    return { label: t.walletConnect.injected, icon: "🦊" };
  }
  return { label: name, icon: "💼" };
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 relative">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Base<span className="text-purple-500"> Memory</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">{t.game.subtitle}</p>
      </div>

      {/* Connect card */}
      <div className="w-full max-w-xs bg-surface-2 border border-border rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-1 text-center">
          {t.walletConnect.title}
        </h2>
        <p className="text-gray-500 text-xs text-center mb-5">
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
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                  bg-surface border border-border text-white text-sm font-medium
                  hover:border-purple-500 hover:bg-surface-2 active:scale-95
                  transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="text-xl">{icon}</span>
                <span className="flex-1 text-left">{label}</span>
                {isConnecting ? (
                  <span className="animate-spin text-purple-400">⟳</span>
                ) : connector.id === "injected" && typeof window !== "undefined" && (window as Window & { ethereum?: unknown }).ethereum ? (
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
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
