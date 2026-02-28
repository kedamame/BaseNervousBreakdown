import { ImageResponse } from "next/og";

export const runtime = "edge";

// Card face-down back design
function CardBack() {
  return (
    <div
      style={{
        width: 100,
        height: 120,
        background: "#0c0c1a",
        border: "2px solid #252540",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7, opacity: 0.28 }}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: "flex", gap: 7 }}>
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#9090c0",
                  display: "flex",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Card face-up: matched (glowing)
function CardMatched({ symbol }: { symbol: string }) {
  return (
    <div
      style={{
        width: 100,
        height: 120,
        background: "rgba(192,132,252,0.18)",
        border: "2.5px solid #c084fc",
        boxShadow: "0 0 22px rgba(192,132,252,0.55)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span style={{ fontSize: 42, color: "#c084fc", display: "flex" }}>{symbol}</span>
      <span style={{ fontSize: 10, color: "#c084fc", letterSpacing: 2, marginTop: 4, display: "flex" }}>
        MATCH
      </span>
      {/* checkmark badge */}
      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#c084fc",
          color: "#fff",
          fontSize: 12,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✓
      </div>
    </div>
  );
}

// Card face-up: flipping (not yet matched)
function CardFlipping({ symbol }: { symbol: string }) {
  return (
    <div
      style={{
        width: 100,
        height: 120,
        background: "rgba(96,165,250,0.1)",
        border: "2px solid #60a5fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 42, color: "#60a5fa", display: "flex" }}>{symbol}</span>
      <span style={{ fontSize: 10, color: "#60a5fa60", letterSpacing: 2, marginTop: 4, display: "flex" }}>
        ?
      </span>
    </div>
  );
}

export async function GET() {
  const GAP = 10;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#030305",
          display: "flex",
          alignItems: "center",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #1a1a2e 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        {/* ── Left: title text ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: 64,
            zIndex: 1,
          }}
        >
          {/* Genre tag */}
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(192,132,252,0.4)",
              padding: "4px 14px",
              marginBottom: 24,
            }}
          >
            <span style={{ color: "#c084fc", fontSize: 13, letterSpacing: 3, display: "flex" }}>
              MEMORY CARD GAME
            </span>
          </div>

          {/* JP title — the star of the show */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 86,
              fontWeight: 900,
              letterSpacing: "-4px",
              lineHeight: 1,
              marginBottom: 12,
              display: "flex",
            }}
          >
            神経衰弱
          </div>

          {/* EN subtitle */}
          <div
            style={{
              color: "#c084fc",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "4px",
              marginBottom: 40,
              display: "flex",
            }}
          >
            Base Memory
          </div>

          {/* Gameplay bullets */}
          {[
            "カードをめくってペアを見つける",
            "NFT・トークンが絵柄になる",
            "Baseチェーンでスコアを記録",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#c084fc",
                  flexShrink: 0,
                  display: "flex",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, display: "flex" }}>
                {t}
              </span>
            </div>
          ))}
        </div>

        {/* ── Right: card grid 4×3 ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            paddingRight: 64,
            zIndex: 1,
          }}
        >
          {/* Row 0: down  matched★  down  down */}
          <div style={{ display: "flex", gap: GAP }}>
            <CardBack />
            <CardMatched symbol="★" />
            <CardBack />
            <CardBack />
          </div>

          {/* Row 1: flip◆  down  down  flip◆  (two cards face-up, being compared) */}
          <div style={{ display: "flex", gap: GAP }}>
            <CardFlipping symbol="◆" />
            <CardBack />
            <CardBack />
            <CardFlipping symbol="◆" />
          </div>

          {/* Row 2: down  down  matched★  down */}
          <div style={{ display: "flex", gap: GAP }}>
            <CardBack />
            <CardBack />
            <CardMatched symbol="★" />
            <CardBack />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, background: "#c084fc", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, display: "flex" }}>
                MATCHED
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, background: "#60a5fa", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, display: "flex" }}>
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
