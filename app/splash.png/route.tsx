import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#c084fc",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: "rgba(0,0,0,0.15)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            marginBottom: 16,
            color: "#ffffff",
          }}
        >
          ★
        </div>
        <div style={{ color: "#ffffff", fontSize: 20, fontWeight: 900, letterSpacing: 1, display: "flex" }}>
          Base Memory
        </div>
      </div>
    ),
    { width: 200, height: 200 }
  );
}
