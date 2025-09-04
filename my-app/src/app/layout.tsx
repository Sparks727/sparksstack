import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "SparksStack | Google Business Profile API Test",
  description: "Test your Google Business Profile API connectivity and OAuth integration.",
  keywords: "Google Business Profile, API Testing, GBP Integration, OAuth2 Authentication",
  authors: [{ name: "SparksStack" }],
  openGraph: {
    title: "SparksStack | Google Business Profile API Test",
    description: "Test your Google Business Profile API connectivity and OAuth integration.",
    url: "https://sparksstack.com",
    siteName: "SparksStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparksStack | Google Business Profile API Test",
    description: "Test your Google Business Profile API connectivity and OAuth integration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P3MPHF29XH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P3MPHF29XH');
          `}
        </Script>
      </head>
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
