/**
 * Ficha pública de un juego.
 * Cuando exista la API de PlayNotes, este tipo puede crecer con slug,
 * demo jugable e interés, sin acoplar la portada a ese servicio.
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
};
