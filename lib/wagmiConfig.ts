import { http, createConfig } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Use public Base RPC or a dedicated RPC-only key (no NEXT_PUBLIC_ALCHEMY_API_KEY)
const BASE_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    farcasterMiniApp(),                            // Farcaster Mini App (auto-connect in Farcaster client)
    injected(),                                     // MetaMask and other browser-injected wallets
    coinbaseWallet({ appName: "Base Memory" }),    // Coinbase Wallet (smart wallet support on Base)
  ],
  transports: {
    [base.id]: http(BASE_RPC_URL),
  },
});
