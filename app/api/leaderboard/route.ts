import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS } from "@/lib/constants";

// Edge runtime: 25s timeout (vs 10s for serverless on Hobby plan)
export const runtime = "edge";
// Cache response for 60 seconds to reduce RPC load
export const revalidate = 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const GAME_COMPLETED_EVENT = parseAbiItem(
  "event GameCompleted(address indexed player, uint32 stage, uint32 moves)"
);

const DEPLOY_BLOCK = BigInt(process.env.CONTRACT_DEPLOY_BLOCK ?? 0);
// Ankr public RPC allows up to ~10 000 blocks per eth_getLogs request
const CHUNK_SIZE = BigInt(10_000);
const PARALLEL_BATCH = 8;

export async function GET() {
  if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
    return NextResponse.json({ entries: [] });
  }

  // Ankr public Base RPC — free, no API key, generous block-range limits
  const client = createPublicClient({
    chain: base,
    transport: http("https://rpc.ankr.com/base", { timeout: 20_000 }),
  });

  try {
    const latestBlock = await client.getBlockNumber();
    const fromBlock = DEPLOY_BLOCK;
    if (fromBlock > latestBlock) return NextResponse.json({ entries: [] });

    const totalBlocks = latestBlock - fromBlock + BigInt(1);
    const numChunks = Number(
      (totalBlocks + CHUNK_SIZE - BigInt(1)) / CHUNK_SIZE
    );

    const allLogs: Awaited<ReturnType<typeof client.getLogs>> = [];
    for (let i = 0; i < numChunks; i += PARALLEL_BATCH) {
      const batchSize = Math.min(PARALLEL_BATCH, numChunks - i);
      const promises = Array.from({ length: batchSize }, (_, j) => {
        const start = fromBlock + BigInt(i + j) * CHUNK_SIZE;
        const end =
          start + CHUNK_SIZE - BigInt(1) > latestBlock
            ? latestBlock
            : start + CHUNK_SIZE - BigInt(1);
        return client.getLogs({
          address: CONTRACT_ADDRESS,
          event: GAME_COMPLETED_EVENT,
          fromBlock: start,
          toBlock: end,
        });
      });
      const results = await Promise.all(promises);
      allLogs.push(...results.flat());
    }

    type GameArgs = { player?: `0x${string}`; stage?: bigint; moves?: bigint };
    const bestByPlayer = new Map<
      string,
      { address: string; stage: number; moves: number }
    >();

    for (const log of allLogs) {
      const { player, stage, moves } = (
        (log as unknown as { args?: GameArgs }).args ?? {}
      );
      if (!player || stage === undefined || moves === undefined) continue;
      const s = Number(stage);
      const m = Number(moves);
      const existing = bestByPlayer.get(player);
      if (
        !existing ||
        s > existing.stage ||
        (s === existing.stage && m < existing.moves)
      ) {
        bestByPlayer.set(player, { address: player, stage: s, moves: m });
      }
    }

    const entries = Array.from(bestByPlayer.values())
      .sort((a, b) => b.stage - a.stage || a.moves - b.moves)
      .slice(0, 20);

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[/api/leaderboard] getLogs failed:", err);
    const msg =
      err instanceof Error
        ? err.message.split("\n")[0]
        : "Failed to fetch leaderboard";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
