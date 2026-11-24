/**
 * Ficha pública de un juego (prototipo visual + puente opcional a PlayNotes).
 */
export const motifs = [
	"cluster",
	"orbit",
	"bars",
	"ring",
	"signal",
	"pills",
	"cross",
	"dots",
] as const;

export type Motif = (typeof motifs)[number];

export type Game = {
	id: string;
	title: string;
	studio: string;
	genre: string;
	demo: boolean;
	motif: Motif;
	provisional: boolean;
	/** UUID `games.id` en PlayNotes cuando esté vinculado. */
	playnotesGameId?: string | null;
	igdbId?: number | null;
	demoUrl?: string | null;
	demoStore?: "steam" | "itch" | null;
};
