import { NextResponse } from "next/server";
import { keccak256, toHex } from "viem";
import { CONTRACT_ADDRESS } from "@/lib/constants";

export const runtime = "edge";

const GAME_COMPLETED_TOPIC0 = keccak256(
  toHex("GameCompleted(address,uint32,uint32)")
) as `0x${string}`;

const DEPLOY_BLOCK = process.env.CONTRACT_DEPLOY_BLOCK ?? "not set";
const RPC = "https://base-mainnet.public.blastapi.io";

export async function GET() {
  try {
    // Get latest block number
    const blockRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "eth_blockNumber", params: [],
      }),
    });
    const blockJson = await blockRes.json();
    const latestBlock = parseInt(blockJson.result, 16);

    // Scan the last 50,000 blocks (most recent activity) with NO topic filter
    // This shows ALL events from the contract regardless of topic0
    const recentFrom = Math.max(0, latestBlock - 50_000);
    const allLogsRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 2,
        method: "eth_getLogs",
        params: [{
          address: CONTRACT_ADDRESS,
          fromBlock: `0x${recentFrom.toString(16)}`,
          toBlock: `0x${latestBlock.toString(16)}`,
        }],
      }),
    });
    const allLogsJson = await allLogsRes.json();

    // Also scan with topic0 filter
    const filteredLogsRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 3,
        method: "eth_getLogs",
        params: [{
          address: CONTRACT_ADDRESS,
          topics: [GAME_COMPLETED_TOPIC0],
          fromBlock: `0x${recentFrom.toString(16)}`,
          toBlock: `0x${latestBlock.toString(16)}`,
        }],
      }),
    });
    const filteredLogsJson = await filteredLogsRes.json();

    return NextResponse.json({
      contractAddress: CONTRACT_ADDRESS,
      deployBlockEnv: DEPLOY_BLOCK,
      latestBlock,
      scannedFrom: recentFrom,
      computedTopic0: GAME_COMPLETED_TOPIC0,
      allLogs: {
        count: Array.isArray(allLogsJson.result) ? allLogsJson.result.length : 0,
        error: allLogsJson.error ?? null,
        sample: Array.isArray(allLogsJson.result)
          ? allLogsJson.result.slice(0, 3)
          : allLogsJson.result,
      },
      filteredLogs: {
        count: Array.isArray(filteredLogsJson.result) ? filteredLogsJson.result.length : 0,
        error: filteredLogsJson.error ?? null,
        sample: Array.isArray(filteredLogsJson.result)
          ? filteredLogsJson.result.slice(0, 3)
          : filteredLogsJson.result,
      },
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
