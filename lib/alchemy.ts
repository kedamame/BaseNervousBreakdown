/**
 * Client-side Alchemy helpers.
 * All actual API calls go through /api/assets (server-side) to keep
 * the Alchemy API key out of the browser bundle.
 */
import { AssetImage } from "./types";
import { DEMO_CARD_COUNT } from "./constants";

async function fetchFromApi(
  address: string,
  type: "nfts" | "tokens"
): Promise<AssetImage[]> {
  const res = await fetch(
    `/api/assets?address=${encodeURIComponent(address)}&type=${type}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.images as AssetImage[]) || [];
}

export async function fetchNFTImages(address: string): Promise<AssetImage[]> {
  return fetchFromApi(address, "nfts");
}

export async function fetchTokenImages(address: string): Promise<AssetImage[]> {
  return fetchFromApi(address, "tokens");
}

/**
 * Returns demo card images from public/demo-cards/ as fallback.
 */
export function getDemoImages(count: number): AssetImage[] {
  const images: AssetImage[] = [];
  for (let i = 1; i <= Math.min(count, DEMO_CARD_COUNT); i++) {
    images.push({
      id: `demo-${i}`,
      imageUrl: `/demo-cards/card-${i}.svg`,
      name: `Demo Card ${i}`,
      type: "demo",
    });
  }
  return images;
}

/**
 * Deduplicates images and fills with demo images if not enough.
 */
export function buildImagePool(
  nfts: AssetImage[],
  tokens: AssetImage[],
  minRequired: number
): AssetImage[] {
  const seen = new Set<string>();
  const pool: AssetImage[] = [];

  for (const img of [...nfts, ...tokens]) {
    if (!seen.has(img.imageUrl)) {
      seen.add(img.imageUrl);
      pool.push(img);
    }
  }

  // Fill with demo images if needed
  if (pool.length < minRequired) {
    const needed = minRequired - pool.length + 5;
    const demoImages = getDemoImages(needed);
    for (const demo of demoImages) {
      if (!seen.has(demo.imageUrl)) {
        seen.add(demo.imageUrl);
        pool.push(demo);
        if (pool.length >= minRequired) break;
      }
    }
  }

  return pool;
}
