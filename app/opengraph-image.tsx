import { ImageResponse } from "next/og";

export const alt = "DirectCollabs: direct brand deals for content creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link preview for Meta / WhatsApp. Built from tokens, no photo, loads instantly. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0A0A0A", color: "#F4F1EA", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
          Direct<span style={{ color: "#C8FF2E" }}>Collabs</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>Brands ko dhoondna chhoro.</span>
          <span style={{ color: "#C8FF2E" }}>Brands ko apne paas aane do.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "rgba(244,241,234,0.6)", letterSpacing: 4 }}>DIRECT BRAND DEALS FOR CONTENT CREATORS</div>
      </div>
    ),
    size,
  );
}
