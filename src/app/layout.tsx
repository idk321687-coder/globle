import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLOBLE 🌍 - Daily 3D Mystery Geography Game",
  description: "Guess the daily mystery country on an interactive 3D globe. Distance and heat clues guide each guess!",
  keywords: ["globle", "geography game", "worldle", "globe 3d", "daily geography puzzle"],
  authors: [{ name: "Globle Team" }]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none`}>
        {children}
      </body>
    </html>
  );
}
