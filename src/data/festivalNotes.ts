/**
 * Entradas de Trello que no son videojuegos del catálogo (42 títulos).
 * Se muestran aparte, sin contarlas como fichas de juego.
 */
export type FestivalCompanion = {
	id: string;
	trelloLabel: string;
	kind: "tool";
	title: string;
	studio: string | null;
	shortDescription: string;
	coverImage: string | null;
	url: string;
};

export const festivalCompanions: FestivalCompanion[] = [
	{
		id: "visual-novel-universe",
		trelloLabel: "Visual Novel Universe",
		kind: "tool",
		title: "Visual Novel Universe",
		studio: null,
		shortDescription:
			"Plataforma web para crear y jugar novelas visuales sin programar: editor visual, mapa de decisiones y comunidad en un solo lugar. No es uno de los 42 videojuegos del festival.",
		coverImage: "https://visualnoveluniverse.com/og-image.jpg",
		url: "https://visualnoveluniverse.com/es-ES",
	},
];

/** @deprecated Usar festivalCompanions */
export const festivalExclusions = festivalCompanions.map((item) => ({
	trelloLabel: item.trelloLabel,
	kind: item.kind,
	reason: item.shortDescription,
}));
