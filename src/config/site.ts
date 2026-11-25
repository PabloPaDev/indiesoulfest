/**
 * Identidad pública del festival y puentes a PlayNotes.
 * Auth y biblioteca viven en PlayNotes; este front no guarda secretos.
 */
export const siteConfig = {
	name: "Indie Soul Fest",
	editionYear: 2026,
	motto: "Cada juego tiene un alma. Detrás, personas.",
	description:
		"Festival digital de videojuegos independientes. Del 1 al 31 de diciembre de 2026. Demos artesanales, sin IA generativa. Organizado por PlayNotes y CarlosEdit.tv.",
	/** Landing promocional (apex / marketing). */
	publicDomain: "indiesoulfest.com",
	/** Catálogo interactivo (misma cookie Auth que PlayNotes). */
	catalogDomain: "indiesoulfest.playnotes.es",
	catalogOrigin: "https://indiesoulfest.playnotes.es",
	playnotesUrl: "https://www.playnotes.es",
	playnotesApiOrigin: "https://www.playnotes.es",
	organizers: "CarlosEdit.tv y PlayNotes",
	designer: "edithmt_design",
	sponsor: "Games 4 Players",
	contactEmail: "carlosedittv@gmail.com",
	instagram: {
		playnotes: {
			label: "@playnotes_",
			href: "https://www.instagram.com/playnotes_/",
		},
		carlos: {
			label: "@carlosedit.tv",
			href: "https://www.instagram.com/carlosedit.tv/",
		},
	},
	dates: {
		label: "1 - 31 de diciembre",
		start: "2026-12-01",
		end: "2026-12-31",
	},
	catalogCapacity: 42,
	social: [
		{
			label: "CarlosEdit.tv · Enlaces",
			href: "https://beacons.ai/carlosedit.tv",
		},
		{
			label: "CarlosEdit.tv · Instagram",
			href: "https://www.instagram.com/carlosedit.tv/",
		},
		{
			label: "CarlosEdit.tv · Threads",
			href: "https://www.threads.net/@carlosedit.tv",
		},
		{
			label: "PlayNotes",
			href: "https://www.playnotes.es/",
		},
	],
} as const;

export function getPlaynotesApiOrigin(): string {
	const fromEnv = process.env.NEXT_PUBLIC_PLAYNOTES_API_ORIGIN?.trim().replace(/\/$/, "");
	if (fromEnv) return fromEnv;
	if (process.env.NODE_ENV === "development") return "http://localhost:3000";
	return siteConfig.playnotesApiOrigin;
}

export function getCatalogOrigin(): string {
	const fromEnv = process.env.NEXT_PUBLIC_CATALOG_ORIGIN?.trim().replace(/\/$/, "");
	if (fromEnv) return fromEnv;
	if (process.env.NODE_ENV === "development") return "http://localhost:3001";
	return siteConfig.catalogOrigin;
}

/** URL de login en PlayNotes con retorno seguro al catálogo. */
export function getPlaynotesLoginUrl(returnPath = "/festival"): string {
	const returnUrl = new URL(returnPath, getCatalogOrigin()).toString();
	const bridge = `/auth/festival-return?to=${encodeURIComponent(returnUrl)}`;
	return `${getPlaynotesApiOrigin()}/login?next=${encodeURIComponent(bridge)}`;
}
