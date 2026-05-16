import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoundGrab v0.16 - FreeSound Downloader",
  description: "Search and download sounds from FreeSound by style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
