import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://smartworldarafath.github.io"),
  title: "Material 3 Expressive Screen UI",
  description:
    "Design interactive Material 3 Expressive screens in the browser and convert them directly into prompts for AI coding tools.",
  openGraph: {
    title: "Material 3 Expressive Screen UI",
    description: "Design Material 3 Expressive screens, link them, preview them, and copy a prompt for your AI coding tool.",
    images: [`${BASE}/og.png`],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: [`${BASE}/og.png`] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400..700,0..1,0&display=block"
        />
      </head>
      <body style={{ fontFamily: "Roboto, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
