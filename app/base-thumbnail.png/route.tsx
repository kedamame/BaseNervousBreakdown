import { ImageResponse } from "next/og";

export const runtime = "edge";

function CardBack() {
  return (
    <div
      style={{
        width: 90,
        height: 110,
        background: "#0c0c1a",
        border: "2px solid #252540",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.28 }}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#9090c0", display: "flex" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardMatched({ symbol }: { symbol: string }) {
  return (
    <div
      style={{
        width: 90,
        height: 110,
        background: "rgba(192,132,252,0.18)",
        border: "2.5px solid #c084fc",
        boxShadow: "0 0 20px rgba(192,132,252,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span style={{ fontSize: 38, color: "#c084fc", display: "flex" }}>{symbol}</span>
      <span style={{ fontSize: 9, color: "#c084fc", letterSpacing: 2, marginTop: 3, display: "flex" }}>MATCH</span>
      <div
        style={{
          position: "absolute",
          top: -9,
          right: -9,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#c084fc",
          color: "#fff",
          fontSize: 11,
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

function CardFlipping({ symbol }: { symbol: string }) {
  return (
    <div
      style={{
        width: 90,
        height: 110,
        background: "rgba(96,165,250,0.1)",
        border: "2px solid #60a5fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 38, color: "#60a5fa", display: "flex" }}>{symbol}</span>
      <span style={{ fontSize: 9, color: "#60a5fa60", letterSpacing: 2, marginTop: 3, display: "flex" }}>?</span>
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

        {/* Left: title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: 80,
            paddingRight: 32,
            zIndex: 1,
          }}
        >
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

          <div style={{ color: "#ffffff", fontSize: 64, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, display: "flex" }}>
            BASE
          </div>
          <div style={{ color: "#c084fc", fontSize: 42, fontWeight: 900, letterSpacing: "2px", lineHeight: 1, marginBottom: 28, display: "flex" }}>
            NERVOUS BREAKDOWN
          </div>

          {["Flip cards to find matching pairs", "Your NFTs & tokens become the cards", "Scores recorded on Base chain"].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c084fc", flexShrink: 0, display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, display: "flex" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Right: card grid 4x3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingRight: 80, zIndex: 1 }}>
          <div style={{ display: "flex", gap: GAP }}>
            <CardBack />
            <CardMatched symbol="★" />
            <CardBack />
            <CardBack />
          </div>
          <div style={{ display: "flex", gap: GAP }}>
            <CardFlipping symbol="◆" />
            <CardBack />
            <CardBack />
            <CardFlipping symbol="◆" />
          </div>
          <div style={{ display: "flex", gap: GAP }}>
            <CardBack />
            <CardBack />
            <CardMatched symbol="★" />
            <CardBack />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, background: "#c084fc", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, display: "flex" }}>MATCHED</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, background: "#60a5fa", display: "flex" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, display: "flex" }}>CHECKING</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
