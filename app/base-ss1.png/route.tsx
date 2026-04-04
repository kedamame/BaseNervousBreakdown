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
            width: 120,
            height: 120,
            border: "5px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 60,
            zIndex: 1,
          }}
        >
          <div style={{ width: 50, height: 50, background: "#ffffff", display: "flex" }} />
        </div>

        {/* Title */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30, zIndex: 1 }}>
          <span style={{ color: "#ffffff", fontSize: 72, fontWeight: 900, letterSpacing: 8, display: "flex" }}>
            BASE
          </span>
          <span style={{ color: "#c084fc", fontSize: 72, fontWeight: 900, letterSpacing: 8, display: "flex" }}>
            MEMORY
          </span>
        </div>

        {/* Subtitle */}
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 28, letterSpacing: 10, display: "flex", zIndex: 1 }}>
          MEMORY CARD GAME ON BASE
        </span>

        {/* Wallet connect card */}
        <div
          style={{
            marginTop: 120,
            width: 900,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, letterSpacing: 6, marginBottom: 12, display: "flex" }}>
            CONNECT WALLET
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, letterSpacing: 4, marginBottom: 50, display: "flex" }}>
            CONNECT YOUR WALLET TO START PLAYING
          </span>

          {/* Wallet buttons */}
          {["MetaMask / Browser Wallet", "Coinbase Wallet", "WalletConnect"].map((name, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                padding: "30px 36px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 16,
              }}
            >
              <div style={{ width: 28, height: 28, background: "#c084fc", display: "flex" }} />
              <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 900, letterSpacing: 4, display: "flex" }}>
                {name.toUpperCase()}
              </span>
            </div>
          ))}

          {/* Leaderboard button */}
          <div
            style={{
              width: "100%",
              padding: "28px 36px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, fontWeight: 900, letterSpacing: 6, display: "flex" }}>
              LEADERBOARD
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1284, height: 2778 }
  );
}
