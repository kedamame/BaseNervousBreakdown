import { ImageResponse } from "next/og";

export const runtime = "edge";

function MatchedCard({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 260,
        height: 260,
        background: `${color}30`,
        border: `4px solid ${color}`,
        boxShadow: `0 0 24px ${color}80`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <span style={{ fontSize: 80, color, display: "flex" }}>{label}</span>
      {/* Checkmark */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#ffffff",
          color: "#030305",
          fontSize: 24,
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

function HiddenCard() {
  return (
    <div
      style={{
        width: 260,
        height: 260,
        background: "#0c0c1a",
        border: "3px solid #252540",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, opacity: 0.25 }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ display: "flex", gap: 14 }}>
            {[0, 1, 2, 3].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: "#9090c0", display: "flex" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function GET() {
  const GAP = 20;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#030305",
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #1a1a2e 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        {/* ── Scoreboard ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "80px 60px 40px",
            zIndex: 1,
          }}
        >
          {/* Top row: Stage / Pairs / Moves */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 24, letterSpacing: 4, fontWeight: 900, display: "flex" }}>STAGE</span>
              <span style={{ color: "#ffffff", fontSize: 80, fontWeight: 900, lineHeight: 1, display: "flex" }}>2</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, letterSpacing: 4, display: "flex", marginBottom: 10 }}>3 / 4 Pairs</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 24, letterSpacing: 4, fontWeight: 900, display: "flex" }}>MOVES</span>
              <span style={{ color: "#ffffff", fontSize: 80, fontWeight: 900, lineHeight: 1, display: "flex" }}>6</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", height: 20, background: "rgba(255,255,255,0.08)", display: "flex", marginBottom: 16 }}>
            <div style={{ width: "75%", height: "100%", background: "#c084fc", display: "flex" }} />
          </div>

          {/* HP bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, letterSpacing: 4, fontWeight: 900, display: "flex" }}>HP</span>
            <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.08)", display: "flex" }}>
              <div style={{ width: "100%", height: "100%", background: "#c084fc", display: "flex" }} />
            </div>
            <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, display: "flex" }}>100</span>
          </div>
        </div>

        {/* ── Card grid 4x4 centered ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            {/* Row 1: matched, hidden, matched, matched */}
            <div style={{ display: "flex", gap: GAP }}>
              <MatchedCard label="🥚" color="#c084fc" />
              <HiddenCard />
              <MatchedCard label="♥" color="#f43f5e" />
              <MatchedCard label="🐸" color="#c084fc" />
            </div>
            {/* Row 2: matched, matched, matched, hidden */}
            <div style={{ display: "flex", gap: GAP }}>
              <MatchedCard label="🥚" color="#c084fc" />
              <MatchedCard label="♥" color="#f43f5e" />
              <MatchedCard label="🐸" color="#c084fc" />
              <HiddenCard />
            </div>
            {/* Row 3: hidden, hidden, hidden, hidden */}
            <div style={{ display: "flex", gap: GAP }}>
              <HiddenCard />
              <HiddenCard />
              <HiddenCard />
              <HiddenCard />
            </div>
            {/* Row 4: hidden, hidden, hidden, hidden */}
            <div style={{ display: "flex", gap: GAP }}>
              <HiddenCard />
              <HiddenCard />
              <HiddenCard />
              <HiddenCard />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1284, height: 2778 }
  );
}
