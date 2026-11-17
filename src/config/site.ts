/**
 * Identidad pública del festival.
 * PlayNotes podrá conectarse más adelante mediante una API propia
 * (sesión, wishlist, ficha de juegos, interés y analítica).
 * No hay secretos ni se asume que la cookie de un dominio sirva en el otro.
 */
export const siteConfig = {
	name: "Indie Soul Fest",
	editionYear: 2026,
	motto: "Cada juego tiene un alma. Detrás, personas.",
	description:
		"Festival digital de videojuegos independientes. Del 1 al 31 de diciembre de 2026. Demos artesanales, sin IA generativa. Organizado por PlayNotes y CarlosEdit.tv.",
	publicDomain: "indiesoulfest.com",
	futureFestivalOrigin: "https://festival.playnotes.es",
	playnotesUrl: "https://playnotes.es",
	organizers: "CarlosEdit.tv y PlayNotes",
	designer: "edithmt_design",
	sponsor: "Games 4 Players",
	dates: {
		label: "1 - 31 de diciembre",
		start: "2026-12-01",
		end: "2026-12-31",
	},
} as const;
