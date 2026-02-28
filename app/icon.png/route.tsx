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
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(192,132,252,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Card grid 2x2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[[0, 1], [2, 3]].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 12 }}>
              {row.map((i) => (
                <div
                  key={i}
                  style={{
                    width: 96,
                    height: 96,
                    background: i === 1 || i === 2 ? "#c084fc22" : "#08080f",
                    border: `3px solid ${i === 1 || i === 2 ? "#c084fc" : "#2a2a3e"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                  }}
                >
                  {i === 1 || i === 2 ? (
                    <span style={{ color: "#c084fc" }}>▣</span>
                  ) : (
                    <span style={{ color: "#2a2a3e" }}>?</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
