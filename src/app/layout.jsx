export const dynamic = 'force-dynamic';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anyme - Anime Streaming",
  description: "Stream your favorite anime in high quality",
  keywords: ["anime", "streaming", "nonton anime", "anime sub indo"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-512.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/icon-512.png",
    },
  },
  manifest: "/manifest.json",
}; // <--- Tadi kamu lupa kurung penutup ini!

export const viewport = {
  themeColor: "#e07820",
};

export default async function RootLayout({ children }) {
  let genres = [];
  try {
    const { getGenres } = await import("@/lib/api");
    const genresData = await getGenres();
    genres = genresData?.data?.genreList || [];
  } catch (error) {
    console.error("Failed to fetch genres:", error);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar genres={genres} />
          <main className="container mx-auto px-4 py-6 flex-1 pb-20 md:pb-6">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
