import type { Metadata } from "next";
import "./globals.css";

const title = "The Arena — Business Services Trade Show in Dubai";
const description =
  "Meet business service providers, book a ready showcase spot or join the free one-hour trial waiting list at The Arena Dubai.";
const canonicalOrigin = "https://thearena.show";
const socialImage = new URL("/og.png", canonicalOrigin).toString();

export const metadata: Metadata = {
  metadataBase: new URL(canonicalOrigin),
  title,
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: canonicalOrigin,
    images: [{ url: socialImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
