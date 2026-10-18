import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ClientProviders } from "@/client/components/client-providers"
import { RootErrorBoundary } from "@/client/components/error-boundary"
import { FaviconSwitcher } from "@/client/components/favicon-switcher"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LivePage — Page Builder",
  description: "Build pages visually with LivePage's drag-and-drop page builder",
  icons: {
    icon: [
      { url: "/favicon-light.svg", media: "(prefers-color-scheme: light)", type: "image/svg+xml" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64 128x128 256x256", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-light.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <FaviconSwitcher />
          <RootErrorBoundary>
            {children}
          </RootErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  )
}
