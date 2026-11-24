import { getPlaynotesApiOrigin, getPlaynotesLoginUrl } from "@/config/site";

export type FestivalSession = {
	authenticated: boolean;
	userId: string | null;
	username: string | null;
};

export type FestivalLibraryStatus = {
	gameId: string;
	igdbId: number | null;
	inLibrary: boolean;
	libraryStatus: string | null;
	wishlist: boolean;
};

export type WishlistResult = {
	success: boolean;
	loginRequired?: boolean;
	alreadyExists?: boolean;
	message: string;
	gameId?: string;
	igdbId?: number | null;
	status?: string;
};

async function festivalFetch(path: string, init?: RequestInit): Promise<Response> {
	const url = `${getPlaynotesApiOrigin()}${path}`;
	return fetch(url, {
		...init,
		credentials: "include",
		headers: {
			Accept: "application/json",
			...(init?.headers ?? {}),
		},
	});
}

export async function fetchFestivalSession(): Promise<FestivalSession> {
	try {
		const res = await festivalFetch("/api/festival/session", { method: "GET" });
		if (!res.ok) {
			return { authenticated: false, userId: null, username: null };
		}
		return (await res.json()) as FestivalSession;
	} catch {
		return { authenticated: false, userId: null, username: null };
	}
}

export async function fetchLibraryStatuses(params: {
	gameIds?: string[];
	igdbIds?: number[];
}): Promise<{ authenticated: boolean; games: FestivalLibraryStatus[] }> {
	const search = new URLSearchParams();
	if (params.gameIds?.length) search.set("gameIds", params.gameIds.join(","));
	if (params.igdbIds?.length) search.set("igdbIds", params.igdbIds.join(","));
	if (![...search.keys()].length) {
		return { authenticated: false, games: [] };
	}

	try {
		const res = await festivalFetch(`/api/festival/library-status?${search}`, {
			method: "GET",
		});
		if (!res.ok) return { authenticated: false, games: [] };
		const data = (await res.json()) as {
			authenticated?: boolean;
			games?: FestivalLibraryStatus[];
		};
		return {
			authenticated: !!data.authenticated,
			games: data.games ?? [],
		};
	} catch {
		return { authenticated: false, games: [] };
	}
}

export async function addToWishlist(params: {
	gameId?: string | null;
	igdbId?: number | null;
}): Promise<WishlistResult> {
	try {
		const res = await festivalFetch("/api/festival/wishlist", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				gameId: params.gameId ?? null,
				igdbId: params.igdbId ?? null,
			}),
		});
		const data = (await res.json()) as WishlistResult;
		if (res.status === 401) {
			return {
				success: false,
				loginRequired: true,
				message: data.message || "Debes iniciar sesión en PlayNotes.",
			};
		}
		return data;
	} catch {
		return {
			success: false,
			message: "No se pudo contactar con PlayNotes.",
		};
	}
}

export { getPlaynotesLoginUrl };
