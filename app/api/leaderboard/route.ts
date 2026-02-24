import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS } from "@/lib/constants";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Must match the deployed contract's event signature exactly.
const GAME_COMPLETED_EVENT = parseAbiItem(
  "event GameCompleted(address indexed player, uint32 stage, uint32 moves)"
);

// Optional server-side env var: set to the contract deployment block number to
// narrow the search range and avoid RPC range-limit errors.
// Example: CONTRACT_DEPLOY_BLOCK=28000000
const DEPLOY_BLOCK = BigInt(process.env.CONTRACT_DEPLOY_BLOCK ?? 0);

export async function GET() {
  if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
    return NextResponse.json({ entries: [] });
  }

  // Prefer Alchemy RPC (server-side key) — supports full historical log ranges.
  // Falls back to public Base RPC if key is not set.
  const apiKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl = apiKey
    ? `https://base-mainnet.g.alchemy.com/v2/${apiKey}`
    : "https://mainnet.base.org";

  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  try {
    const logs = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: GAME_COMPLETED_EVENT,
      fromBlock: DEPLOY_BLOCK,
      toBlock: "latest",
    });

    // Aggregate: best score per player (highest stage, fewest moves as tiebreaker)
    const bestByPlayer = new Map<string, { address: string; stage: number; moves: number }>();
    for (const log of logs) {
      const { player, stage, moves } = log.args;
      if (!player || stage === undefined || moves === undefined) continue;
      const s = Number(stage);
      const m = Number(moves);
      const existing = bestByPlayer.get(player);
      if (!existing || s > existing.stage || (s === existing.stage && m < existing.moves)) {
        bestByPlayer.set(player, { address: player, stage: s, moves: m });
      }
    }

    const entries = Array.from(bestByPlayer.values())
      .sort((a, b) => b.stage - a.stage || a.moves - b.moves)
      .slice(0, 20);

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[/api/leaderboard] error:", err);
    const msg = err instanceof Error ? err.message.split("\n")[0] : "Failed to fetch leaderboard";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
