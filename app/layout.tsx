import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ClientProviders } from "@/client/components/client-providers"
import { RootErrorBoundary } from "@/client/components/error-boundary"
import { FaviconSwitcher } from "@/client/components/favicon-switcher"

const inter = Inter({ subsets: ["latin"] })

const siteTitle = "LivePage — Page Builder"
const siteDescription =
  "Build pages visually with LivePage's drag-and-drop page builder. Compose layouts, customize every detail, and export clean HTML, CSS, and JavaScript."

/**
 * Base URL for absolute meta tags (Open Graph, canonical, Twitter).
 * Override with NEXT_PUBLIC_SITE_URL in production deploys.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://livepage.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · LivePage",
  },
  description: siteDescription,
  applicationName: "LivePage",
  authors: [{ name: "LivePage" }],
  creator: "LivePage",
  keywords: [
    "page builder",
    "drag and drop",
    "visual editor",
    "HTML export",
    "landing page",
    "no-code",
    "web design",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "LivePage",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "LivePage — visual page builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon-light.svg", media: "(prefers-color-scheme: light)", type: "image/svg+xml" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64 128x128 256x256", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-light.svg",
  },
  other: {
    "theme-color": "#0f172a",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LivePage",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  description: siteDescription,
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
