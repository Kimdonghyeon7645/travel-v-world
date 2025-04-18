/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.ttf",
  display: "swap",
  weight: "45 920",
});
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          src={`http://map.vworld.kr/js/webglMapInit.js.do?version=3.0&apiKey=${process.env.NEXT_PUBLIC_VWORLD_MAP_KEY}`}
        />
      </head>
      <body className={`${pretendard.className} antialiased`}>{children}</body>
    </html>
  );
}
