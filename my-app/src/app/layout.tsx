import "./globals.css"
import { ClerkClientProvider } from "./clerk-provider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SparksStack",
  description: "Dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkClientProvider>
          {children}
        </ClerkClientProvider>
      </body>
    </html>
  )
}


