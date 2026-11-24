/**
 * Ficha editorial del catálogo Indie Soul Fest.
 * El material visual/editorial es del festival; la identidad canónica
 * del juego en PlayNotes es playnotesGameId / igdbId (cuando exista).
 */
export type DemoStore = "steam" | "itch";

export type FestivalGameStatus = "ready" | "pending";

export type FestivalGame = {
	/** Slug estable del festival. */
	id: string;
	/** Orden editorial (1…N de la lista confirmada). */
	slot: number;
	/** false = no mostrar en el grid público. */
	published: boolean;
	/** ready = materiales verificados; pending = documentado sin publicar ficha completa. */
	status: FestivalGameStatus;
	/** Motivo si status === pending (homónimo, sin ficha, etc.). */
	pendingReason: string | null;
	title: string | null;
	studio: string | null;
	/** Descripción breve oficial (Steam ES / estudio), sin inventar. */
	shortDescription: string | null;
	/** Cápsula/header oficial. */
	coverImage: string | null;
	/** Logo oficial del juego/estudio. */
	logoImage: string | null;
	/** Portada vertical de biblioteca Steam (600×900). */
	libraryCapsule: string | null;
	/** Fondo ancho de biblioteca Steam (3840×1240). */
	libraryHero: string | null;
	/** Cápsula principal de Steam (616×353), con logo; menos panorámica que el header. */
	mainCapsule: string | null;
	/** Capturas oficiales (thumbnails). */
	screenshots: string[];
	/**
	 * Tráiler oficial. Steam actual suele servir HLS (.m3u8);
	 * solo se carga al reproducir en la ficha.
	 */
	trailerUrl: string | null;
	trailerPoster: string | null;
	/** Ficha oficial (Steam / itch), distinta de la demo. */
	storeUrl: string | null;
	/** Demo externa verificada; nunca alojada aquí. */
	demoUrl: string | null;
	demoStore: DemoStore | null;
	steamAppId: number | null;
	/** UUID `games.id` en PlayNotes (fase posterior). */
	playnotesGameId: string | null;
	/** Identificador IGDB canónico (fase posterior). */
	igdbId: number | null;
};

export function emptyFestivalSlot(slot: number): FestivalGame {
	const n = String(slot).padStart(2, "0");
	return {
		id: `slot-${n}`,
		slot,
		published: false,
		status: "pending",
		pendingReason: "Hueco reservado sin estudio confirmado.",
		title: null,
		studio: null,
		shortDescription: null,
		coverImage: null,
		logoImage: null,
		libraryCapsule: null,
		libraryHero: null,
		mainCapsule: null,
		screenshots: [],
		trailerUrl: null,
		trailerPoster: null,
		storeUrl: null,
		demoUrl: null,
		demoStore: null,
		steamAppId: null,
		playnotesGameId: null,
		igdbId: null,
	};
}
