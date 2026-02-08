import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/providers/theme-provider";
import { ReactNode } from "react";
import { PAGE_PADDING_X, ROOT_LAYOUT_HEADER_HEIGHT } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { ConvexClientProvider } from "@/providers/ConvexProvider";
import { PWAInstaller } from "@/components/common/PWAInstaller";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Itesiwaju Community Club",
    template: "%s | Itesiwaju"
  },
  description:
    "Building Progress Together - A vibrant community dedicated to mutual growth, cultural preservation, and collective prosperity.",
  applicationName: "Itesiwaju",
  authors: [{ name: "Itesiwaju Community" }],
  keywords: [
    "community",
    "club",
    "events",
    "members",
    "account management",
    "Yoruba",
    "cultural preservation",
    "mutual growth",
    "prosperity"
  ],
  creator: "Itesiwaju Community",
  publisher: "Itesiwaju Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'fr': '/fr',
      'yo': '/yo',
      'de': '/de',
    },
  },
  openGraph: {
    title: "Itesiwaju Community Club",
    description: "Building Progress Together - A vibrant community dedicated to mutual growth, cultural preservation, and collective prosperity.",
    url: '/',
    siteName: "Itesiwaju",
    images: [
      {
        url: '/images/logo.png',
        width: 212,
        height: 212,
        alt: 'Itesiwaju Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Itesiwaju Community Club",
    description: "Building Progress Together - A vibrant community dedicated to mutual growth, cultural preservation, and collective prosperity.",
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Itesiwaju',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f97316" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Itesiwaju" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Itesiwaju Community Club",
              "description": "Building Progress Together - A vibrant community dedicated to mutual growth, cultural preservation, and collective prosperity.",
              "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "logo": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/images/logo.png`,
              "sameAs": []
            })
          }}
        />
      </head>
      <body
        style={
          {
            "--header-h": `${ROOT_LAYOUT_HEADER_HEIGHT}px`,
            "--page-px": `${PAGE_PADDING_X}px`,
          } as never
        }
        className={`${montserrat.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50 font-sans dark:bg-black`}
      >
        <NextIntlClientProvider>
          <AuthProvider>
            <ConvexClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster position="top-center" richColors />
                <PWAInstaller />
              </ThemeProvider>
            </ConvexClientProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
