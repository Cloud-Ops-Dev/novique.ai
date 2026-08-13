import { ImageResponse } from "next/og";

// Site-wide default OG card (1200×630). Route segments can shadow this with
// their own opengraph-image or openGraph.images when a richer card exists.
export const alt = "Novique — AI consulting and products";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0f0d",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#4cc9b0",
            fontWeight: 600,
          }}
        >
          AI consulting + products
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 120, fontWeight: 700, color: "#e6edea" }}>
              Novique
            </span>
            <span style={{ fontSize: 120, fontWeight: 700, color: "#4cc9b0" }}>
              .
            </span>
            <span style={{ fontSize: 120, fontWeight: 700, color: "#a7b5b0" }}>
              ai
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#a7b5b0", marginTop: 8 }}>
            Put AI to work in your business.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #24312c",
            paddingTop: 28,
            fontSize: 26,
            color: "#6f7f79",
          }}
        >
          <span>www.novique.ai</span>
          <span style={{ color: "#4cc9b0" }}>Build in public. Ship for real.</span>
        </div>
      </div>
    ),
    size
  );
}
