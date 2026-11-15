import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import AuthLink from "@/components/AuthLink";
import CartLink from "@/components/CartLink";
import MenuToggle from "@/components/MenuToggle";
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
  title: "BrewLite",
  description: "Đặt đồ uống không dùng tiền mặt",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between border-b border-foreground/10 px-10 py-9 sm:px-5 sm:py-9">
          <div className="flex items-center">
            <Suspense fallback={null}>
              <MenuToggle />
            </Suspense>
            <Link
              href="/"
              className="rounded-md bg-foreground px-2.5 py-1.5 text-lg font-black uppercase leading-none tracking-wide text-background sm:px-3.5 sm:py-2 sm:text-2xl"
            >
              BrewLite
            </Link>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap text-sm sm:gap-4 sm:text-base">
            <AuthLink />
            <CartLink />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
