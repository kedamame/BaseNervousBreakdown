import { ImageResponse } from "next/og";

export const runtime = "edge";

type S = "down" | "matched" | "flipping";

const CW = 108;
const CH = 128;
const GAP = 12;
const COLS = 4;

// 4×3 = 12 cards: most face-down, one matched ★ pair, one flipping ◆ pair
const GRID: { s: S }[] = [
  { s: "down" },    { s: "down" },     { s: "matched" },  { s: "down" },
  { s: "flipping" },{ s: "down" },     { s: "down" },     { s: "flipping" },
  { s: "down" },    { s: "matched" },  { s: "down" },     { s: "down" },
];

function Card({ s }: { s: S }) {
  const isMatched = s === "matched";
  const isFlipping = s === "flipping";
  const isFaceUp = isMatched || isFlipping;

  const bg = isMatched
    ? "rgba(192,132,252,0.2)"
    : isFlipping
    ? "rgba(96,165,250,0.12)"
    : "#0b0b18";
  const border = isMatched ? "#c084fc" : isFlipping ? "#60a5fa" : "#252538";
  const shadow = isMatched
    ? "0 0 20px rgba(192,132,252,0.6), 0 0 6px rgba(192,132,252,0.3)"
    : "none";

  return (
    <div
      style={{
        width: CW,
        height: CH,
        background: bg,
        border: `2.5px solid ${border}`,
        boxShadow: shadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {isFaceUp ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 44, color: isMatched ? "#c084fc" : "#60a5fa", display: "flex" }}>
            {isMatched ? "★" : "◆"}
          </span>
          {isMatched && (
            <div style={{ fontSize: 11, color: "#c084fc", letterSpacing: 2, display: "flex" }}>
              MATCH
            </div>
          )}
        </div>
      ) : (
        // Face-down: 3×3 dot grid (card back)
        <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.3 }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((c) => (
                <div
                  key={c}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#a0a0c8", display: "flex" }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {isMatched && (
        <div
          style={{
            position: "absolute",
            top: -11,
            right: -11,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#c084fc",
            color: "#fff",
            fontSize: 13,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}

export async function GET() {
  const rows: { s: S }[][] = [];
  for (let i = 0; i < GRID.length; i += COLS) {
    rows.push(GRID.slice(i, i + COLS));
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#030305",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid BG */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #1c1c30 1.5px, transparent 1.5px)",
            backgroundSize: "34px 34px",
            opacity: 0.55,
            display: "flex",
          }}
        />

        {/* Left: text block */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: 72,
            paddingRight: 40,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(192,132,252,0.12)",
              border: "1px solid rgba(192,132,252,0.35)",
              padding: "5px 14px",
              marginBottom: 28,
            }}
          >
            <span style={{ color: "#c084fc", fontSize: 14, letterSpacing: 3, display: "flex" }}>
              MEMORY CARD GAME
            </span>
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: "-3px",
              lineHeight: 1,
              marginBottom: 10,
              display: "flex",
            }}
          >
            神経衰弱
          </div>

          <div
            style={{
              color: "#c084fc",
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "3px",
              marginBottom: 36,
              display: "flex",
            }}
          >
            Base Memory
          </div>

          {[
            "カードをめくってペアを探す",
            "NFT・トークンが絵柄に",
            "Baseチェーン上で記録",
          ].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c084fc", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, display: "flex" }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Right: card grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            zIndex: 1,
            paddingRight: 72,
          }}
        >
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: GAP }}>
              {row.map((card, ci) => (
                <Card key={ci} s={card.s} />
              ))}
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, background: "#c084fc", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 1, display: "flex" }}>
                MATCHED
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, background: "#60a5fa", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 1, display: "flex" }}>
                CHECKING
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
