import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#030305",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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

        {/* Logo */}
        <div
          style={{
            width: 100,
            height: 100,
            border: "4px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            zIndex: 1,
          }}
        >
          <div style={{ width: 42, height: 42, background: "#ffffff", display: "flex" }} />
        </div>

        {/* Stage Clear title */}
        <span style={{ color: "#ffffff", fontSize: 72, fontWeight: 900, letterSpacing: 8, marginBottom: 20, display: "flex", zIndex: 1 }}>
          STAGE 3 CLEAR!
        </span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 26, letterSpacing: 8, marginBottom: 100, display: "flex", zIndex: 1 }}>
          HEAD TO THE NEXT STAGE
        </span>

        {/* Stats card */}
        <div
          style={{
            width: 900,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "50px 60px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          {/* Pairs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, letterSpacing: 6, fontWeight: 900, display: "flex" }}>PAIRS</span>
            <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, display: "flex" }}>6 pairs</span>
          </div>
          {/* Moves */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "36px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, letterSpacing: 6, fontWeight: 900, display: "flex" }}>MOVES</span>
            <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, display: "flex" }}>15 moves</span>
          </div>
          {/* Efficiency */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "36px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, letterSpacing: 6, fontWeight: 900, display: "flex" }}>EFFICIENCY</span>
            <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, display: "flex" }}>40%</span>
          </div>
          {/* HP */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, letterSpacing: 6, fontWeight: 900, display: "flex" }}>HP</span>
              <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, display: "flex" }}>80 / 100</span>
            </div>
            {/* HP bar */}
            <div style={{ width: "100%", height: 24, background: "rgba(255,255,255,0.08)", display: "flex" }}>
              <div style={{ width: "80%", height: "100%", background: "#c084fc", display: "flex" }} />
            </div>
          </div>
        </div>

        {/* Next stage button */}
        <div
          style={{
            width: 900,
            marginTop: 40,
            padding: "44px 0",
            background: "rgba(192,132,252,0.08)",
            border: "2px solid rgba(192,132,252,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <span style={{ color: "#c084fc", fontSize: 36, fontWeight: 900, letterSpacing: 8, display: "flex" }}>
            STAGE 4 →
          </span>
        </div>
      </div>
    ),
    { width: 1284, height: 2778 }
  );
}
