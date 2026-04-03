import { http, createConfig } from "wagmi";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Use public Base RPC or a dedicated RPC-only key (no NEXT_PUBLIC_ALCHEMY_API_KEY)
const BASE_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

// Optional WalletConnect support for mobile browsers (requires WC Cloud project ID)
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

const connectors = [
  farcasterMiniApp(),                            // Farcaster Mini App (auto-connect in Farcaster client)
  injected(),                                     // MetaMask and other browser-injected wallets
  coinbaseWallet({ appName: "Base Memory" }),    // Coinbase Wallet (smart wallet support on Base)
  // WalletConnect: only add if project ID is configured
  ...(WC_PROJECT_ID
    ? [walletConnect({ projectId: WC_PROJECT_ID, metadata: { name: "Base Memory", description: "Memory Card Game on Base", url: "https://base-nervous-breakdown.vercel.app", icons: ["https://base-nervous-breakdown.vercel.app/icon.png"] } })]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(BASE_RPC_URL),
  },
});
