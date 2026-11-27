/** Cliente browser → BFF Indie Soul Fest (nunca tokens en localStorage). */

export type PlaynotesAuthUser = {
	id: string;
	username: string | null;
	avatarUrl: string | null;
};

export type PlaynotesSessionPayload = {
	authenticated: boolean;
	user: PlaynotesAuthUser | null;
	csrfToken: string | null;
	scopes?: string[];
	deviceId?: string;
	error?: string;
};

export type RemoteListGame = {
	gameId: string;
	igdbId: number | null;
	title: string | null;
	coverUrl: string | null;
	position: number;
};

export type RemoteListPayload = {
	list: {
		id: string;
		title: string;
		description?: string | null;
		integrationKey: string;
		createdAt: string;
	} | null;
	games: RemoteListGame[];
	added?: number;
	skipped?: number;
	unresolved_igdb_ids?: number[];
	invalid_igdb_ids?: number[];
	rejected_game_ids?: string[];
	invalid_game_ids?: string[];
};

async function parseJson<T>(res: Response): Promise<T> {
	return (await res.json()) as T;
}

export async function fetchPlaynotesSession(): Promise<PlaynotesSessionPayload> {
	try {
		const res = await fetch("/api/playnotes/session", {
			method: "GET",
			credentials: "same-origin",
			headers: { Accept: "application/json" },
			cache: "no-store",
		});
		return await parseJson<PlaynotesSessionPayload>(res);
	} catch {
		return { authenticated: false, user: null, csrfToken: null };
	}
}

let connectInFlight = false;

/** Una sola navegación OAuth; evita bucles de redirect/popup. */
export function startPlaynotesConnect(): void {
	if (typeof window === "undefined") return;
	if (connectInFlight) return;
	try {
		if (window.sessionStorage.getItem("isf.oauth.connecting") === "1") return;
		window.sessionStorage.setItem("isf.oauth.connecting", "1");
	} catch {
		/* ignore */
	}
	connectInFlight = true;
	window.location.assign("/api/playnotes/oauth/start");
}

export function clearPlaynotesConnectLock(): void {
	connectInFlight = false;
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem("isf.oauth.connecting");
	} catch {
		/* ignore */
	}
}

export async function logoutPlaynotes(csrfToken: string): Promise<boolean> {
	try {
		const res = await fetch("/api/playnotes/logout", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				Accept: "application/json",
				"X-CSRF-Token": csrfToken,
			},
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function fetchRemoteFestivalList(): Promise<{
	ok: boolean;
	status: number;
	data?: RemoteListPayload;
	error?: string;
}> {
	try {
		const res = await fetch("/api/playnotes/list", {
			method: "GET",
			credentials: "same-origin",
			headers: { Accept: "application/json" },
			cache: "no-store",
		});
		const data = await parseJson<RemoteListPayload & { error?: string }>(res);
		if (!res.ok) {
			return { ok: false, status: res.status, error: data.error };
		}
		return { ok: true, status: res.status, data };
	} catch {
		return { ok: false, status: 0, error: "network" };
	}
}

export async function importRemoteFestivalList(
	csrfToken: string,
	params: { gameIds?: string[]; igdbIds?: number[] },
): Promise<{
	ok: boolean;
	status: number;
	data?: RemoteListPayload;
	error?: string;
}> {
	try {
		const body: { game_ids?: string[]; igdb_ids?: number[] } = {};
		if (params.gameIds?.length) body.game_ids = params.gameIds;
		if (params.igdbIds?.length) body.igdb_ids = params.igdbIds;
		const res = await fetch("/api/playnotes/list/import", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify(body),
		});
		const data = await parseJson<RemoteListPayload & { error?: string }>(res);
		if (!res.ok) {
			return { ok: false, status: res.status, error: data.error };
		}
		return { ok: true, status: res.status, data };
	} catch {
		return { ok: false, status: 0, error: "network" };
	}
}

export async function addRemoteFestivalGame(
	csrfToken: string,
	params: { gameId?: string; igdbId?: number },
): Promise<{
	ok: boolean;
	status: number;
	data?: RemoteListPayload;
	error?: string;
}> {
	try {
		const res = await fetch("/api/playnotes/list/games", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify(
				params.gameId
					? { game_id: params.gameId }
					: { igdb_id: params.igdbId },
			),
		});
		const data = await parseJson<RemoteListPayload & { error?: string }>(res);
		if (!res.ok) {
			return { ok: false, status: res.status, error: data.error };
		}
		return { ok: true, status: res.status, data };
	} catch {
		return { ok: false, status: 0, error: "network" };
	}
}

export async function removeRemoteFestivalGame(
	csrfToken: string,
	params: { gameId?: string; igdbId?: number },
): Promise<{
	ok: boolean;
	status: number;
	data?: RemoteListPayload;
	error?: string;
}> {
	try {
		const res = await fetch("/api/playnotes/list/games", {
			method: "DELETE",
			credentials: "same-origin",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify(
				params.gameId
					? { game_id: params.gameId }
					: { igdb_id: params.igdbId },
			),
		});
		const data = await parseJson<RemoteListPayload & { error?: string }>(res);
		if (!res.ok) {
			return { ok: false, status: res.status, error: data.error };
		}
		return { ok: true, status: res.status, data };
	} catch {
		return { ok: false, status: 0, error: "network" };
	}
}
