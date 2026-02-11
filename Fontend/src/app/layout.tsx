import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TenderAI - Intelligent Tender Management",
  description:
    "AI-powered platform for tender, RFP, and RFQ management with compliance tracking and automated proposal generation",
  keywords: [
    "tender management",
    "RFP",
    "RFQ",
    "AI",
    "compliance",
    "proposal generation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
