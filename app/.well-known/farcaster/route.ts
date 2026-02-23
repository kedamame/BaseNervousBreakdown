import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://localhost:3000";

export async function GET() {
  // accountAssociation is generated via:
  // https://farcaster.xyz/~/settings/developer-tools
  // Set these 3 env vars in your Vercel dashboard (NOT NEXT_PUBLIC_ — server-side only)
  const header = process.env.FARCASTER_MANIFEST_HEADER;
  const payload = process.env.FARCASTER_MANIFEST_PAYLOAD;
  const signature = process.env.FARCASTER_MANIFEST_SIGNATURE;

  // If manifest credentials are not set, return a development placeholder
  const isDev = !header || !payload || !signature;

  const manifest = {
    accountAssociation: isDev
      ? {
          // Development placeholder — not valid for Farcaster auth
          // Set FARCASTER_MANIFEST_HEADER/PAYLOAD/SIGNATURE in production
          header: "DEVELOPMENT_PLACEHOLDER",
          payload: "DEVELOPMENT_PLACEHOLDER",
          signature: "DEVELOPMENT_PLACEHOLDER",
        }
      : { header, payload, signature },
    miniapp: {
      name: "Base神経衰弱",
      iconUrl: `${APP_URL}/og-image.png`,
      homeUrl: APP_URL,
      version: "1.0.0",
      categories: ["games"],
      description:
        "あなたのBaseウォレットのNFT・トークンでプレイする神経衰弱ゲーム",
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      // Use shorter cache in dev, longer in production
      "Cache-Control": isDev
        ? "no-cache"
        : "public, max-age=300, s-maxage=300",
    },
  });
}
