import { NextRequest, NextResponse } from "next/server";
import { Alchemy, Network, NftFilters } from "alchemy-sdk";

// Server-side only - ALCHEMY_API_KEY (no NEXT_PUBLIC_ prefix)
function getAlchemy(): Alchemy {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is not configured");
  }
  return new Alchemy({ apiKey, network: Network.BASE_MAINNET });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const type = searchParams.get("type"); // "nfts" | "tokens"

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (type !== "nfts" && type !== "tokens") {
    return NextResponse.json(
      { error: "type must be 'nfts' or 'tokens'" },
      { status: 400 }
    );
  }

  try {
    const alchemy = getAlchemy();

    if (type === "nfts") {
      const response = await alchemy.nft.getNftsForOwner(address, {
        excludeFilters: [NftFilters.SPAM],
        pageSize: 100,
      });

      const images = response.ownedNfts
        .map((nft) => ({
          id: `nft-${nft.contract.address}-${nft.tokenId}`,
          imageUrl:
            nft.image?.cachedUrl ||
            nft.image?.thumbnailUrl ||
            nft.image?.originalUrl ||
            nft.image?.pngUrl ||
            null,
          name:
            nft.name || nft.contract.name || `NFT #${nft.tokenId}`,
          type: "nft" as const,
          contractAddress: nft.contract.address,
          tokenId: nft.tokenId,
        }))
        .filter(
          (img) =>
            img.imageUrl &&
            (img.imageUrl.startsWith("https://") ||
              img.imageUrl.startsWith("http://"))
        );

      return NextResponse.json({ images });
    }

    // tokens
    const balances = await alchemy.core.getTokenBalances(address);
    const nonZero = balances.tokenBalances.filter(
      (t) => t.tokenBalance && t.tokenBalance !== "0x0" && t.tokenBalance !== null
    );

    const metaResults = await Promise.allSettled(
      nonZero.slice(0, 30).map((t) =>
        alchemy.core.getTokenMetadata(t.contractAddress)
      )
    );

    const images = metaResults
      .map((result, i) => {
        if (result.status !== "fulfilled" || !result.value.logo) return null;
        const meta = result.value;
        const logo = meta.logo;
        if (!logo || !logo.startsWith("https://")) return null;
        return {
          id: `token-${nonZero[i].contractAddress}`,
          imageUrl: logo,
          name: meta.name || meta.symbol || "Unknown Token",
          type: "token" as const,
          contractAddress: nonZero[i].contractAddress,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Alchemy API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
