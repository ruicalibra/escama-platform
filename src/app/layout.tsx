import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escama — Peixe e Marisco Fresco",
  description: "Da lota para a sua mesa. Peixe e marisco fresco entregue em Luanda.",
  manifest: "/manifest.json",
  themeColor: "#FFFFFF",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="bg-salt font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
