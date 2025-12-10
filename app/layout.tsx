import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SEO Insights - Professional SEO Research Tool by OfficeX Appstore",
  description: "Powerful SEO tool for keyword research, domain analytics, and paid ads analysis powered by DataForSEO.",
  icons: {
    icon: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCg9HR4EafHkpEqIK60rrzZtETFnlWaIKBIg&s",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCg9HR4EafHkpEqIK60rrzZtETFnlWaIKBIg&s",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCg9HR4EafHkpEqIK60rrzZtETFnlWaIKBIg&s",
        type: "image/svg+xml",
      },
    ],
    apple: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCg9HR4EafHkpEqIK60rrzZtETFnlWaIKBIg&s",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
