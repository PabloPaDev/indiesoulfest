import { Kalam, Lexend } from "next/font/google";
import localFont from "next/font/local";

/** Lexend: tipografía de interfaz de PlayNotes (widget aislado). */
export const playnotesLexend = Lexend({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-playnotes",
	display: "swap",
});

/** Play Pretend: título, subtítulo de estudios y rótulos de display. */
export const playPretend = localFont({
	src: "../fonts/PlayPretend.otf",
	variable: "--font-play",
	display: "swap",
	weight: "400",
	adjustFontFallback: false,
});

/** Bank Gothic Medium: organizadores, bocadillo, fechas y textos de interfaz. */
export const bankGothic = localFont({
	src: "../fonts/BankGothic.ttf",
	variable: "--font-bank",
	display: "swap",
	weight: "400",
	adjustFontFallback: false,
});

/** Pixel Digivolve: rótulos dentro de la pantalla de la consola. */
export const pixelDigivolve = localFont({
	src: "../fonts/PixelDigivolve.otf",
	variable: "--font-pixel-face",
	display: "swap",
	weight: "400",
	adjustFontFallback: false,
});

/** Kalam: misma tipografía manuscrita que el texto de reseñas en PlayNotes. */
export const kalam = Kalam({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-kalam",
	display: "swap",
});
