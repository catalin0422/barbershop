import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barbershop — Premium Grooming Studio",
  description:
    "Programări online, frizeri experimentați și o experiență de grooming premium.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={`${sans.variable} ${display.variable} dark`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
