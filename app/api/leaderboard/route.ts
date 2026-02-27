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
// avoid scanning from genesis and to stay within public RPC range limits.
// Example: CONTRACT_DEPLOY_BLOCK=28000000
const DEPLOY_BLOCK = BigInt(process.env.CONTRACT_DEPLOY_BLOCK ?? 0);

// Public RPCs typically reject getLogs requests spanning more than ~2 000 blocks.
// When no Alchemy key is set we chunk the range and execute chunks in parallel
// to keep wall-clock time reasonable.
const PUBLIC_CHUNK_SIZE = BigInt(1800);   // conservative, fits within most RPC limits
const PUBLIC_PARALLEL_BATCH = 8;          // concurrent chunks per batch (avoid rate-limit)

export async function GET() {
  if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
    return NextResponse.json({ entries: [] });
  }

  // Prefer Alchemy RPC (server-side key) — supports unlimited historical log ranges.
  // Falls back to public Base RPC with chunked getLogs if key is not set.
  const apiKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl = apiKey
    ? `https://base-mainnet.g.alchemy.com/v2/${apiKey}`
    : "https://mainnet.base.org";
  const useChunking = !apiKey;

  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl, { timeout: 20_000 }),
  });

  try {
    // Fetch logs — single call for Alchemy, chunked for public RPC
    const rawLogs = !useChunking
      ? await client.getLogs({
          address: CONTRACT_ADDRESS,
          event: GAME_COMPLETED_EVENT,
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        })
      : await (async () => {
          // Public RPC: split into fixed-size chunks and run in parallel batches
          const latestBlock = await client.getBlockNumber();
          const fromBlock = DEPLOY_BLOCK;
          if (fromBlock > latestBlock) return [];

          const totalBlocks = latestBlock - fromBlock + BigInt(1);
          const numChunks = Number(
            (totalBlocks + PUBLIC_CHUNK_SIZE - BigInt(1)) / PUBLIC_CHUNK_SIZE
          );

          const allLogs: Awaited<ReturnType<typeof client.getLogs>> = [];
          for (let i = 0; i < numChunks; i += PUBLIC_PARALLEL_BATCH) {
            const batchSize = Math.min(PUBLIC_PARALLEL_BATCH, numChunks - i);
            const chunkPromises = Array.from({ length: batchSize }, (_, j) => {
              const start = fromBlock + BigInt(i + j) * PUBLIC_CHUNK_SIZE;
              const end =
                start + PUBLIC_CHUNK_SIZE - BigInt(1) > latestBlock
                  ? latestBlock
                  : start + PUBLIC_CHUNK_SIZE - BigInt(1);
              return client.getLogs({
                address: CONTRACT_ADDRESS,
                event: GAME_COMPLETED_EVENT,
                fromBlock: start,
                toBlock: end,
              });
            });
            const results = await Promise.all(chunkPromises);
            allLogs.push(...results.flat());
          }
          return allLogs;
        })();

    type GameArgs = { player?: `0x${string}`; stage?: bigint; moves?: bigint };

    // Aggregate: best score per player (highest stage, fewest moves as tiebreaker)
    const bestByPlayer = new Map<string, { address: string; stage: number; moves: number }>();
    for (const log of rawLogs) {
      const { player, stage, moves } = ((log as unknown as { args?: GameArgs }).args ?? {});
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
    const rpcLabel = apiKey ? "Alchemy" : "public Base RPC";
    console.error(`[/api/leaderboard] getLogs failed (${rpcLabel}):`, err);
    const msg = err instanceof Error ? err.message.split("\n")[0] : "Failed to fetch leaderboard";
    return NextResponse.json({ error: `${msg} (via ${rpcLabel})` }, { status: 500 });
  }
}
