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
import { ConvexClientProvider } from "@/providers/ConvexProvider";
import { AuthProvider } from "@/providers/auth-provider";

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
  title: "Itesiwaju Community Club",
  description:
    "Building Progress Together - A vibrant community dedicated to mutual growth, cultural preservation, and collective prosperity.",
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
          <ConvexClientProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </AuthProvider>
          </ConvexClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
