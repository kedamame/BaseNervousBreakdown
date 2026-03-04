import { NextResponse } from "next/server";
import { createPublicClient, http, keccak256, toHex } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS } from "@/lib/constants";

// Edge runtime: 25s timeout (vs 10s for serverless on Hobby plan)
export const runtime = "edge";
// Cache response for 60 seconds to reduce RPC load
export const revalidate = 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// topic0 = keccak256("GameCompleted(address,uint32,uint32)")
// Pass as flat topics array — some RPCs reject viem's nested [[topic0]] format
const GAME_COMPLETED_TOPIC0 = keccak256(
  toHex("GameCompleted(address,uint32,uint32)")
) as `0x${string}`;

const DEPLOY_BLOCK = BigInt(process.env.CONTRACT_DEPLOY_BLOCK ?? 0);
const CHUNK_SIZE = BigInt(50_000);  // BlastAPI supports large ranges
const PARALLEL_BATCH = 4;

export async function GET() {
  if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
    return NextResponse.json({ entries: [] });
  }

  // BlastAPI public Base RPC — free, no API key, supports large block ranges
  const client = createPublicClient({
    chain: base,
    transport: http("https://base-mainnet.public.blastapi.io", { timeout: 20_000 }),
  });

  try {
    const latestBlock = await client.getBlockNumber();
    const fromBlock = DEPLOY_BLOCK;
    if (fromBlock > latestBlock) return NextResponse.json({ entries: [] });

    const totalBlocks = latestBlock - fromBlock + BigInt(1);
    const numChunks = Number(
      (totalBlocks + CHUNK_SIZE - BigInt(1)) / CHUNK_SIZE
    );

    type RawLog = { topics: readonly `0x${string}`[]; data: `0x${string}` };
    const allLogs: RawLog[] = [];

    for (let i = 0; i < numChunks; i += PARALLEL_BATCH) {
      const batchSize = Math.min(PARALLEL_BATCH, numChunks - i);
      const promises = Array.from({ length: batchSize }, (_, j) => {
        const start = fromBlock + BigInt(i + j) * CHUNK_SIZE;
        const end =
          start + CHUNK_SIZE - BigInt(1) > latestBlock
            ? latestBlock
            : start + CHUNK_SIZE - BigInt(1);
        // Use raw request to pass flat topics array.
        // viem's typed getLogs wraps topics in [[topic]] which some RPCs reject.
        return client.request({
          method: "eth_getLogs",
          params: [
            {
              address: CONTRACT_ADDRESS,
              topics: [GAME_COMPLETED_TOPIC0],
              fromBlock: `0x${start.toString(16)}`,
              toBlock: `0x${end.toString(16)}`,
            },
          ],
        });
      });
      const results = await Promise.all(promises);
      allLogs.push(...results.flat());
    }

    const bestByPlayer = new Map<
      string,
      { address: string; stage: number; moves: number }
    >();

    for (const log of allLogs) {
      if (!log.topics || log.topics.length < 2) continue;
      // player is indexed → topics[1], left-padded to 32 bytes
      const player = `0x${log.topics[1].slice(-40)}` as `0x${string}`;
      // data = abi.encode(uint32 stage, uint32 moves) → 32 bytes each
      const data = log.data.startsWith("0x") ? log.data.slice(2) : log.data;
      const stage = parseInt(data.slice(0, 64), 16);
      const moves = parseInt(data.slice(64, 128), 16);
      if (!player || isNaN(stage) || isNaN(moves)) continue;

      const existing = bestByPlayer.get(player);
      if (
        !existing ||
        stage > existing.stage ||
        (stage === existing.stage && moves < existing.moves)
      ) {
        bestByPlayer.set(player, { address: player, stage, moves });
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
