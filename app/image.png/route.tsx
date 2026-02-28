import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#030305",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid dot pattern background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, #1e1e2e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.6,
            display: "flex",
          }}
        />

        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Card grid preview */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 48,
            opacity: 0.9,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 80,
                height: 80,
                background: i === 2 || i === 4 ? "#c084fc22" : "#08080f",
                border: `2px solid ${i === 2 || i === 4 ? "#c084fc" : "#1e1e2e"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              {i === 2 || i === 4 ? (
                <span style={{ color: "#c084fc" }}>▣</span>
              ) : (
                <span style={{ color: "#1e1e2e", fontSize: 24 }}>?</span>
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            color: "#c084fc",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-2px",
            marginBottom: 12,
            display: "flex",
          }}
        >
          Base Memory
        </div>

        {/* Japanese subtitle */}
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 24,
            letterSpacing: "8px",
            marginBottom: 24,
            display: "flex",
          }}
        >
          神経衰弱
        </div>

        {/* Description */}
        <div
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 18,
            letterSpacing: "1px",
            textAlign: "center",
            maxWidth: 600,
            display: "flex",
          }}
        >
          Play memory match with your NFTs &amp; tokens on Base
        </div>

        {/* Base badge */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.3)",
            fontSize: 16,
            letterSpacing: "3px",
          }}
        >
          <span style={{ color: "#c084fc" }}>●</span>
          <span>BASE</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
