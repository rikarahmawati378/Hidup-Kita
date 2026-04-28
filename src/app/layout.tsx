import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HidupKita — Habit Tracker",
  description:
    "HidupKita adalah aplikasi habit tracker untuk membantu Anda membangun kebiasaan positif setiap hari.",
  keywords: ["habit tracker", "kebiasaan", "produktivitas", "HidupKita"],
};

import LayoutWrapper from "@/components/LayoutWrapper";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-garden-bg text-garden-brown`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <BottomNav />
      </body>
    </html>
  );
}
