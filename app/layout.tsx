import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://localhost:3000";
const APP_NAME = "Base神経衰弱";
const APP_DESCRIPTION =
  "あなたのBaseウォレットのNFT・トークンでプレイする神経衰弱ゲーム";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${APP_URL}/og-image.png`,
      button: {
        title: "Play Now",
        action: {
          type: "launch_frame",
          name: APP_NAME,
          url: APP_URL,
          splashImageUrl: `${APP_URL}/og-image.png`,
          splashBackgroundColor: "#0a0a0f",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
