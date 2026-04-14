import {
  Cormorant_Garamond,
  Playfair_Display,
  Great_Vibes,
  Cinzel,
  Cardo,
} from "next/font/google";

export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

export const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const cardo = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export type MonogramFont = {
  id: string;
  label: string;
  // CSS variable (used by Tailwind / inline style)
  cssVariable: string;
  // The font-family name to put in SVG <text font-family="...">
  family: string;
};

export const MONOGRAM_FONTS: MonogramFont[] = [
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    cssVariable: "var(--font-cormorant)",
    family: "Cormorant Garamond, serif",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    cssVariable: "var(--font-playfair)",
    family: "Playfair Display, serif",
  },
  {
    id: "great-vibes",
    label: "Great Vibes",
    cssVariable: "var(--font-great-vibes)",
    family: "Great Vibes, cursive",
  },
  {
    id: "cinzel",
    label: "Cinzel",
    cssVariable: "var(--font-cinzel)",
    family: "Cinzel, serif",
  },
  {
    id: "cardo",
    label: "Cardo",
    cssVariable: "var(--font-cardo)",
    family: "Cardo, serif",
  },
];

export const DEFAULT_FONT_ID = "cormorant";
