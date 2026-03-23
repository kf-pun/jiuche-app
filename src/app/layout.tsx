import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "揪車 JiuChe — 減碳共乘平台",
  description: "企業員工智慧共乘，共同減碳，邁向 ESG 永續目標",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} antialiased bg-gray-100 min-h-screen`}>
        <AuthProvider>
          {/* 手機版外框 */}
          <div className="relative mx-auto max-w-md min-h-screen bg-gray-50 shadow-2xl flex flex-col">
            <main className="flex-1 overflow-y-auto pb-20">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
