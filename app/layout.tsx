import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "禅·静水 — 禅意解压",
  description:
    "以水波纹为核心的交互式禅意解压网站：冥想呼吸、环境白噪音、抛石问心、专注计时。",
  manifest: "/manifest.webmanifest",
  applicationName: "静水",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "静水",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f2a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
