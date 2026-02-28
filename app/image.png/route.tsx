import { ImageResponse } from "next/og";

export const runtime = "edge";

// Card state for the illustration
type CardState = "down" | "up" | "matched";
const CARDS: { state: CardState; symbol?: string; color?: string }[] = [
  { state: "down" },
  { state: "matched", symbol: "★", color: "#c084fc" },
  { state: "down" },
  { state: "down" },
  { state: "matched", symbol: "★", color: "#c084fc" },
  { state: "down" },
  { state: "down" },
  { state: "up", symbol: "◆", color: "#60a5fa" },
  { state: "down" },
  { state: "down" },
  { state: "up", symbol: "◆", color: "#60a5fa" },
  { state: "down" },
  { state: "down" },
  { state: "down" },
  { state: "down" },
  { state: "down" },
  { state: "down" },
  { state: "down" },
];

const COLS = 6;
const CARD_W = 92;
const CARD_H = 92;
const CARD_GAP = 10;

function Card({ state, symbol, color }: (typeof CARDS)[number]) {
  const isMatched = state === "matched";
  const isUp = state === "up" || isMatched;

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: isMatched
          ? "rgba(192,132,252,0.18)"
          : isUp
          ? "rgba(96,165,250,0.12)"
          : "#0c0c18",
        border: `2px solid ${
          isMatched ? "#c084fc" : isUp ? "#60a5fa" : "#1e1e30"
        }`,
        boxShadow: isMatched ? "0 0 18px rgba(192,132,252,0.5)" : "none",
      }}
    >
      {isUp ? (
        <span
          style={{
            fontSize: 38,
            color: color,
            fontWeight: 900,
            display: "flex",
          }}
        >
          {symbol}
        </span>
      ) : (
        // Face-down: 4-dot pattern
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          {[[0, 1], [2, 3]].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 10 }}>
              {row.map((_, ci) => (
                <div
                  key={ci}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#2a2a42",
                    display: "flex",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {/* Match checkmark badge */}
      {isMatched && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#c084fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#fff",
            fontWeight: 900,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}

export async function GET() {
  const rows: (typeof CARDS)[] = [];
  for (let i = 0; i < CARDS.length; i += COLS) {
    rows.push(CARDS.slice(i, i + COLS));
  }

  const gridW = COLS * CARD_W + (COLS - 1) * CARD_GAP;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#030305",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          padding: "0 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, #1a1a2e 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        {/* Left: title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            zIndex: 1,
            flex: 1,
            paddingRight: 48,
          }}
        >
          {/* MATCH indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(192,132,252,0.15)",
              border: "1px solid rgba(192,132,252,0.4)",
              padding: "6px 16px",
              marginBottom: 32,
            }}
          >
            <span style={{ color: "#c084fc", fontSize: 18, display: "flex" }}>
              ✓ MATCH
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-3px",
              marginBottom: 12,
              display: "flex",
            }}
          >
            神経衰弱
          </div>

          {/* EN title */}
          <div
            style={{
              color: "#c084fc",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "2px",
              marginBottom: 28,
              display: "flex",
            }}
          >
            Base Memory
          </div>

          {/* Description */}
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>あなたのNFT・トークンで</span>
            <span>プレイする神経衰弱ゲーム</span>
          </div>

          {/* Base badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 36,
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
              letterSpacing: "4px",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#c084fc",
                display: "flex",
              }}
            />
            <span>ON BASE</span>
          </div>
        </div>

        {/* Right: card grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: CARD_GAP,
            zIndex: 1,
            width: gridW,
            flexShrink: 0,
          }}
        >
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: CARD_GAP }}>
              {row.map((card, ci) => (
                <Card key={ci} {...card} />
              ))}
            </div>
          ))}

          {/* "MATCHING..." label under the blue pair */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <span
              style={{
                color: "#60a5fa",
                fontSize: 13,
                letterSpacing: "3px",
                opacity: 0.8,
                display: "flex",
              }}
            >
              CHECKING...
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
