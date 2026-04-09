import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Cormorant_Garamond, Lora, Montserrat, Inter, EB_Garamond, Bodoni_Moda, Prata, Outfit, Poppins, Raleway, Forum } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import DataInitializer from "@/app/components/DataInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const forum = Forum({
  variable: "--font-forum",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "HotelMate | Booking Engine",
  description: "Experience the pinnacle of luxury with HotelMate's elite booking sanctuary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} ${lora.variable} ${montserrat.variable} ${inter.variable} ${ebGaramond.variable} ${bodoni.variable} ${prata.variable} ${outfit.variable} ${poppins.variable} ${raleway.variable} ${forum.variable} antialiased`}
      >
        <StoreProvider>
          <ThemeProvider>
            <DataInitializer>
              {children}
            </DataInitializer>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
