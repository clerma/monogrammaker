import type { Metadata } from "next";
import {
  cormorant,
  playfair,
  greatVibes,
  cinzel,
  cardo,
} from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monogram Maker",
  description:
    "Design vintage wedding monograms and crests in your browser. Pick initials, a decorative frame, and a font — download as SVG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    cormorant.variable,
    playfair.variable,
    greatVibes.variable,
    cinzel.variable,
    cardo.variable,
  ].join(" ");

  return (
    <html
      lang="en"
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
