import type { FestivalGame } from "@/types/festival-game";

/** Steam a veces sirve thumbs `.600x338`; el fondo pide la versión ancha. */
function preferWideScreenshot(url: string): string {
	return url.replace(/\.600x338(\.jpg)/i, "$1");
}

/** ID de YouTube si el tráiler es un enlace watch/embed/youtu.be. */
export function getYoutubeVideoId(url: string | null | undefined): string | null {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, "");
		if (host === "youtu.be") {
			const id = parsed.pathname.split("/").filter(Boolean)[0];
			return id || null;
		}
		if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
			const fromQuery = parsed.searchParams.get("v");
			if (fromQuery) return fromQuery;
			const parts = parsed.pathname.split("/").filter(Boolean);
			if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
				return parts[1] || null;
			}
		}
	} catch {
		return null;
	}
	return null;
}

export function getYoutubeEmbedUrl(videoId: string): string {
	const params = new URLSearchParams({
		autoplay: "1",
		rel: "0",
		modestbranding: "1",
		playsinline: "1",
	});
	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/** Portada / cápsula horizontal oficial (header 460×215). */
export function getFestivalCoverUrl(game: FestivalGame): string | null {
	return game.coverImage ?? game.trailerPoster ?? null;
}

/** Portada vertical de biblioteca (600×900); null si el juego no la tiene. */
export function getFestivalPortraitUrl(game: FestivalGame): string | null {
	return game.libraryCapsule;
}

/** Fondo del Explorador: hero de biblioteca Steam, o una captura ancha. */
export function getFestivalBackdropUrl(game: FestivalGame): string | null {
	if (game.libraryHero) return game.libraryHero;
	const shot = game.screenshots.find(Boolean);
	if (shot) return preferWideScreenshot(shot);
	return getFestivalCoverUrl(game);
}
