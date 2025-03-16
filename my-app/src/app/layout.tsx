import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkClientProvider } from './clerk-provider';
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SparksStack | Google Business Profile Review Manager",
  description: "Manage and monitor your Google Business Profile reviews, ratings, and locations all in one place. Boost your online reputation with SparksStack's review management platform.",
  keywords: "Google Business Profile, Review Management, Business Reviews, GBP Management, Multi-location Management, Review Analytics",
  authors: [{ name: "SparksStack" }],
  openGraph: {
    title: "SparksStack | Google Business Profile Review Manager",
    description: "Manage and monitor your Google Business Profile reviews, ratings, and locations all in one place.",
    url: "https://sparksstack.com",
    siteName: "SparksStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparksStack | Google Business Profile Review Manager",
    description: "Manage and monitor your Google Business Profile reviews across multiple locations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkClientProvider>
          {children}
          <Analytics />
        </ClerkClientProvider>
      </body>
    </html>
  );
}
