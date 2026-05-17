import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoundGrab 0.3 - Sound Downloader",
  description: "Search and download sounds from FreeSound, OpenGameArt, SoundBible, and Sonniss by style",
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
