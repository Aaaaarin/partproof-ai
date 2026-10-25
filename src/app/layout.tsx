import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/shell";
import { Provider } from "@/components/provider";
import { asset } from "@/lib/data";
export const metadata: Metadata = {
  title: "PartProof AI — Precision starts here",
  description:
    "Phone-first 3D pre-inspection intelligence. An interactive ZEISS Beyond Code hackathon prototype.",
  manifest: asset("/manifest.webmanifest"),
  icons: { icon: asset("/icon.svg"), apple: asset("/icon-192.png") },
  appleWebApp: {
    capable: true,
    title: "PartProof AI",
    statusBarStyle: "black-translucent",
  },
};
export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
