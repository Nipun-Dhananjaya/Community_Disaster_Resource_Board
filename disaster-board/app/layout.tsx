import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-source-serif", display: "swap" });
const sans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-source-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Community Disaster Resource Board",
  description: "Find shelters, supplies, volunteers and rides near you, kept current by the people running them.",
};
export const viewport: Viewport = { themeColor: "#12304d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
