import { ImageResponse } from "next/og";

export const alt = "Arwas World: comfy, customized apparel and drinkware";
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
          padding: 72,
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Arwas World
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 800,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: -2,
            }}
          >
            Comfy. Customized.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 800,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: -2,
              color: "#ff6a2b",
            }}
          >
            Yours.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a8a8a8" }}>
          Hoodies, tees, jerseys, polos and drinkware. Kenya, Oman and worldwide.
        </div>
      </div>
    ),
    size,
  );
}
