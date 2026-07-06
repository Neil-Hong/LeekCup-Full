import type { Metadata } from "next";
import { Quintessential } from "next/font/google";
import "./globals.css";

const quint = Quintessential({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "84452 Leek Cup - Football Draw",
  description: "84452 Leek Cup draw ceremony",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${quint.className} min-h-screen w-full`}
        style={{
          backgroundImage: "url(/images/bg4.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {children}
      </body>
    </html>
  );
}
