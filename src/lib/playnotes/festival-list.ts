import { getPlaynotesApiOrigin, getPlaynotesLoginUrl } from "@/config/site";

/** Nombre de la lista personal objetivo en PlayNotes (cuando exista el endpoint). */
export const FESTIVAL_LIST_NAME = "Mi Indie Soul Fest 2026";

export const FESTIVAL_LIST_STORAGE_KEY = "isf.playnotes.festival-list.v1";

export type FestivalListSnapshot = {
	/** IDs de `FestivalGame.id` en orden de añadido. */
	gameIds: string[];
	updatedAt: string;
};

export type FestivalListSyncState =
	| "local-only"
	| "login-required"
	| "endpoint-missing"
	| "error"
	| "ok";

export type FestivalListSyncResult = {
	state: FestivalListSyncState;
	message: string;
	listUrl?: string | null;
};

export function readFestivalListLocal(): FestivalListSnapshot {
	if (typeof window === "undefined") {
		return { gameIds: [], updatedAt: new Date(0).toISOString() };
	}
	try {
		const raw = window.localStorage.getItem(FESTIVAL_LIST_STORAGE_KEY);
		if (!raw) return { gameIds: [], updatedAt: new Date(0).toISOString() };
		const parsed = JSON.parse(raw) as Partial<FestivalListSnapshot>;
		const gameIds = Array.isArray(parsed.gameIds)
			? parsed.gameIds.filter((id): id is string => typeof id === "string")
			: [];
		return {
			gameIds,
			updatedAt:
				typeof parsed.updatedAt === "string"
					? parsed.updatedAt
					: new Date().toISOString(),
		};
	} catch {
		return { gameIds: [], updatedAt: new Date(0).toISOString() };
	}
}

export function writeFestivalListLocal(gameIds: string[]): FestivalListSnapshot {
	const snapshot: FestivalListSnapshot = {
		gameIds,
		updatedAt: new Date().toISOString(),
	};
	if (typeof window !== "undefined") {
		window.localStorage.setItem(
			FESTIVAL_LIST_STORAGE_KEY,
			JSON.stringify(snapshot),
		);
	}
	return snapshot;
}

/**
 * Intenta guardar la selección en una lista personal de PlayNotes.
 * Hoy el API público del festival solo expone session / library-status / wishlist.
 * No inventamos endpoints: si `/api/festival/lists` no existe, lo comunicamos.
 */
export async function saveFestivalListToPlaynotes(params: {
	gameIds: string[];
	authenticated: boolean;
}): Promise<FestivalListSyncResult> {
	if (params.gameIds.length === 0) {
		return {
			state: "local-only",
			message: "Añade algún juego antes de guardar la lista en PlayNotes.",
		};
	}

	if (!params.authenticated) {
		return {
			state: "login-required",
			message:
				"Inicia sesión en PlayNotes para guardar «Mi Indie Soul Fest 2026» en tu cuenta.",
		};
	}

	try {
		const res = await fetch(`${getPlaynotesApiOrigin()}/api/festival/lists`, {
			method: "POST",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: FESTIVAL_LIST_NAME,
				gameIds: params.gameIds,
			}),
		});

		if (res.status === 401) {
			return {
				state: "login-required",
				message: "Tu sesión de PlayNotes ha caducado. Vuelve a entrar.",
			};
		}

		if (res.status === 404) {
			return {
				state: "endpoint-missing",
				message:
					"PlayNotes aún no expone el endpoint de listas del festival. Tu selección sigue guardada en este navegador.",
			};
		}

		if (!res.ok) {
			return {
				state: "error",
				message: "No se pudo guardar la lista en PlayNotes ahora mismo.",
			};
		}

		const data = (await res.json()) as { listUrl?: string; message?: string };
		return {
			state: "ok",
			message:
				data.message ??
				`Lista «${FESTIVAL_LIST_NAME}» guardada en tu cuenta de PlayNotes.`,
			listUrl: data.listUrl ?? null,
		};
	} catch {
		return {
			state: "error",
			message: "No se pudo contactar con PlayNotes.",
		};
	}
}

export function getFestivalListLoginUrl(): string {
	return getPlaynotesLoginUrl("/festival");
}
