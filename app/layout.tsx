import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ClientProviders } from "@/client/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LivePage — Page Builder",
  description: "Build pages visually with LivePage's drag-and-drop page builder",
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
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
