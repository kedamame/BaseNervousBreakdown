import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://base-nervous-breakdown.vercel.app";

export async function GET() {
  const header = process.env.FARCASTER_MANIFEST_HEADER;
  const payload = process.env.FARCASTER_MANIFEST_PAYLOAD;
  const signature = process.env.FARCASTER_MANIFEST_SIGNATURE;

  const isDev = !header || !payload || !signature;

  const manifest = {
    accountAssociation: isDev
      ? {
          header: "DEVELOPMENT_PLACEHOLDER",
          payload: "DEVELOPMENT_PLACEHOLDER",
          signature: "DEVELOPMENT_PLACEHOLDER",
        }
      : { header, payload, signature },
    frame: {
      name: "BaseNervousBreakdown",
      version: "1",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/image.png`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#c084fc",
      webhookUrl: `${APP_URL}/api/webhook`,
      subtitle: "concentration",
      description:
        "This is a miniapp that lets you play a memory game using images of NFTs and tokens in your wallet.",
      primaryCategory: "games",
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": isDev
        ? "no-cache"
        : "public, max-age=300, s-maxage=300",
    },
  });
}
