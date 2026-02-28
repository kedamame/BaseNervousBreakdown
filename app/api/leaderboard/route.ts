import { NextResponse } from "next/server";
import { keccak256, toHex } from "viem";
import { CONTRACT_ADDRESS } from "@/lib/constants";

// Cache the response for 60 seconds (ISR-style) to avoid hammering Basescan
export const revalidate = 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// topic0 = keccak256("GameCompleted(address,uint32,uint32)")
const GAME_COMPLETED_TOPIC0 = keccak256(toHex("GameCompleted(address,uint32,uint32)"));

const DEPLOY_BLOCK = process.env.CONTRACT_DEPLOY_BLOCK ?? "0";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY ?? "";

export async function GET() {
  if (CONTRACT_ADDRESS === ZERO_ADDRESS) {
    return NextResponse.json({ entries: [] });
  }

  try {
    const keyParam = BASESCAN_API_KEY ? `&apikey=${BASESCAN_API_KEY}` : "";
    const url =
      `https://api.basescan.org/api?module=logs&action=getLogs` +
      `&address=${CONTRACT_ADDRESS}` +
      `&topic0=${GAME_COMPLETED_TOPIC0}` +
      `&fromBlock=${DEPLOY_BLOCK}` +
      `&toBlock=latest` +
      `&page=1&offset=1000` +
      keyParam;

    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Basescan HTTP ${res.status}`);

    const json = await res.json();

    // status "0" with "No records found" is a valid empty result
    if (json.status !== "1") {
      if (json.message === "No records found") {
        return NextResponse.json({ entries: [] });
      }
      throw new Error(json.message ?? "Basescan API error");
    }

    type BasescanLog = { topics: string[]; data: string };
    const logs: BasescanLog[] = Array.isArray(json.result) ? json.result : [];

    // Aggregate: best score per player (highest stage, fewest moves as tiebreaker)
    const bestByPlayer = new Map<string, { address: string; stage: number; moves: number }>();

    for (const log of logs) {
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
    console.error("[/api/leaderboard] Basescan fetch failed:", err);
    const msg =
      err instanceof Error ? err.message.split("\n")[0] : "Failed to fetch leaderboard";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
