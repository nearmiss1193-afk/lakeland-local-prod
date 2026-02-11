import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LakelandFinds - Find the Best Local Businesses in Lakeland, FL",
  description: "Discover, compare, and connect with 3,300+ local businesses in Lakeland, FL. Rated by real customers.",
  openGraph: {
    title: "LakelandFinds - Lakeland's Local Business Directory",
    description: "Discover, compare, and connect with 3,300+ local businesses in Lakeland, FL.",
    url: "https://lakelandfinds.com",
    siteName: "LakelandFinds",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LakelandFinds - Lakeland's Local Business Directory",
    description: "Discover, compare, and connect with 3,300+ local businesses in Lakeland, FL.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-sans min-h-screen antialiased flex flex-col")}>
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
