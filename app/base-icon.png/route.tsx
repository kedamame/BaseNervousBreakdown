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
          fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Card grid 2x2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>
          {[[0, 1], [2, 3]].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 20 }}>
              {row.map((i) => {
                const matched = i === 1 || i === 2;
                return (
                  <div
                    key={i}
                    style={{
                      width: 180,
                      height: 220,
                      background: matched ? "rgba(192,132,252,0.18)" : "#0c0c1a",
                      border: `4px solid ${matched ? "#c084fc" : "#252540"}`,
                      boxShadow: matched ? "0 0 28px rgba(192,132,252,0.5)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {matched ? (
                      <>
                        <span style={{ fontSize: 72, color: "#c084fc", display: "flex" }}>★</span>
                        <span style={{ fontSize: 16, color: "#c084fc", letterSpacing: 3, marginTop: 6, display: "flex" }}>
                          MATCH
                        </span>
                        {/* Checkmark badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: -14,
                            right: -14,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#c084fc",
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✓
                        </div>
                      </>
                    ) : (
                      /* Dot pattern for face-down cards */
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.3 }}>
                        {[0, 1, 2].map((r) => (
                          <div key={r} style={{ display: "flex", gap: 12 }}>
                            {[0, 1, 2].map((c) => (
                              <div
                                key={c}
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#9090c0",
                                  display: "flex",
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Title below cards */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <span
              style={{
                color: "#ffffff",
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: "-1px",
                display: "flex",
              }}
            >
              BASE
            </span>
            <span
              style={{
                color: "#c084fc",
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: "-1px",
                marginLeft: 14,
                display: "flex",
              }}
            >
              MEMORY
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1024, height: 1024 }
  );
}
