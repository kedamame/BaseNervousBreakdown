import { base } from "wagmi/chains";

export const SUPPORTED_CHAIN = base;
export const CHAIN_ID = base.id;

// Contract address (set after deployment)
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const MEMORY_GAME_ABI = [
  {
    inputs: [
      { internalType: "uint32", name: "stage", type: "uint32" },
      { internalType: "uint32", name: "moves", type: "uint32" },
    ],
    name: "recordGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getRecords",
    outputs: [
      {
        components: [
          { internalType: "uint32", name: "stage", type: "uint32" },
          { internalType: "uint32", name: "moves", type: "uint32" },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
        ],
        internalType: "struct MemoryGame.GameRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getHighestStage",
    outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint32", name: "stage", type: "uint32" },
      { indexed: false, internalType: "uint32", name: "moves", type: "uint32" },
    ],
    name: "GameCompleted",
    type: "event",
  },
] as const;

// Number of demo images available in public/demo-cards/
export const DEMO_CARD_COUNT = 20;
