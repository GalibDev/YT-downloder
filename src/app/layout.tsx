import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YT Downloader Pro - Free High Speed YouTube Video & MP3 Downloader",
  description: "Download YouTube videos in 1080p, 720p, 4K, 480p and convert YouTube to MP3 audio easily with fast speed and no ads.",
  keywords: ["YouTube downloader", "download YouTube video", "YouTube to MP3", "1080p YouTube download", "free video downloader"],
  openGraph: {
    title: "YT Downloader Pro - Free High Speed YouTube Downloader",
    description: "Fast, high-quality YouTube video & audio downloader in 1080p, 720p, 480p & MP3.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#09090b] text-slate-100 antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
