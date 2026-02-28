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
        {/* Card icon */}
        <div
          style={{
            width: 120,
            height: 120,
            background: "rgba(0,0,0,0.15)",
            border: "3px solid rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            marginBottom: 32,
            color: "#ffffff",
          }}
        >
          ▣
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          Base Memory
        </div>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}
