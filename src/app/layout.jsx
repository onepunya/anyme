 const dynamic = 'force-dynamic';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
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
  title: "Anyme - Anime Streaming", // Ganti nama jadi Anyme sekalian
  description: "Stream your favorite anime in high quality",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar genres={genres} />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}