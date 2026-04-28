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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
