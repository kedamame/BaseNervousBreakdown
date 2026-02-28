import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { I18nProvider } from "@/lib/i18n";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://base-nervous-breakdown.vercel.app";
const APP_NAME = "Base Memory";
const APP_DESCRIPTION =
  "Memory Card Game on Base — play with your NFTs & tokens";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/image.png`],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${APP_URL}/image.png`,
      button: {
        title: "Play Now",
        action: {
          type: "launch_frame",
          name: "Base神経衰弱",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/splash.png`,
          splashBackgroundColor: "#c084fc",
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
    <html lang="en">
      <body>
        <I18nProvider>
          <Web3Provider>{children}</Web3Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
