import localFont from "next/font/local";

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
