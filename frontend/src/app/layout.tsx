import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { NEXT_THEMES_HEAD_INIT } from "@/app/theme-blocking-script";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mediverse.local"),
  title: {
    default: "MediVerse — AI-powered healthcare, trusted doctors",
    template: "%s · MediVerse",
  },
  description:
    "MediVerse is an AI-powered healthcare platform that connects patients with verified specialists. Chat with the AI assistant, scan reports, and book consultations.",
  keywords: [
    "healthcare",
    "telemedicine",
    "AI health assistant",
    "report analysis",
    "doctor appointment",
    "medical AI",
    "MediVerse",
  ],
  authors: [{ name: "MediVerse" }],
  openGraph: {
    type: "website",
    siteName: "MediVerse",
    title: "MediVerse — AI-powered healthcare, trusted doctors",
    description:
      "Chat with an AI health assistant, scan medical reports, and book consultations with verified specialists.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediVerse — AI-powered healthcare, trusted doctors",
    description:
      "Chat with an AI health assistant, scan medical reports, and book consultations with verified specialists.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: NEXT_THEMES_HEAD_INIT.trim(),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
