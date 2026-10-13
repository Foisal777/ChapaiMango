import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Default OG image rendered at /opengraph-image.
 *
 * Used by Facebook, WhatsApp, Twitter, LinkedIn, iMessage, Telegram, etc.
 * to show a 1200x630 preview when someone shares any page from this
 * site. Per-page OG images can override this by exporting their own
 * opengraph-image file in the corresponding route folder.
 */
export const runtime = "edge";
export const alt = `${SITE.name} — চাঁপাইনবাবগঞ্জের গাছপাকা আম`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #fff7e8 0%, #ffdc80 50%, #f59e0b 100%)",
          padding: 80,
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            fontSize: 360,
            opacity: 0.18
          }}
        >
          🥭
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            fontSize: 260,
            opacity: 0.14
          }}
        >
          🌿
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 48,
            color: "#7c2d12",
            fontWeight: 700
          }}
        >
          <span style={{ fontSize: 96 }}>🥭</span>
          <span>{SITE.name}</span>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 84,
            fontWeight: 800,
            color: "#1a0f00",
            textAlign: "center",
            lineHeight: 1.05,
            maxWidth: 1000
          }}
        >
          চাঁপাইনবাবগঞ্জের সেরা আম
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 36,
            color: "#1a0f00",
            opacity: 0.75,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.3
          }}
        >
          গাছপাকা · কেমিক্যাল-মুক্ত · সরাসরি বাগান থেকে
        </div>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            gap: 16,
            fontSize: 28,
            color: "#7c2d12"
          }}
        >
          <span style={pill}>হিমসাগর</span>
          <span style={pill}>ল্যাংড়া</span>
          <span style={pill}>ক্ষীরসাপাত</span>
          <span style={pill}>ফজলি</span>
        </div>
      </div>
    ),
    size
  );
}

const pill = {
  padding: "12px 28px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.6)",
  border: "2px solid rgba(124,45,18,0.2)"
} as const;
