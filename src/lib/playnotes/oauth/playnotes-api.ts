import "server-only";

import {
	getPlaynotesOrigin,
	INDIE_SOUL_FEST_CLIENT_ID,
} from "@/lib/playnotes/oauth/config";
import {
	clearSessionCookies,
	readAccessToken,
	readRefreshToken,
	rotateAccessCookie,
	rotateRefreshCookie,
	setSessionCookies,
	type StoredUser,
} from "@/lib/playnotes/oauth/cookies";

export type TokenResponse = {
	token_type: string;
	access_token: string;
	expires_in: number;
	refresh_token: string;
	refresh_expires_in: number;
	scope?: string;
	device_id?: string;
	user?: {
		id: string;
		username?: string | null;
		avatar_url?: string | null;
	};
};

export type IsfMeResponse = {
	user: {
		id: string;
		username: string | null;
		avatar_url: string | null;
	};
	deviceId: string;
	scopes: string[];
};

export type IsfListGame = {
	gameId: string;
	igdbId: number | null;
	title: string | null;
	coverUrl: string | null;
	position: number;
};

export type IsfListResponse = {
	list: {
		id: string;
		title: string;
		description?: string | null;
		integrationKey: string;
		createdAt: string;
	} | null;
	integrationKey?: string;
	games: IsfListGame[];
};

export type IsfImportResponse = IsfListResponse & {
	added: number;
	skipped: number;
	unresolved_igdb_ids?: number[];
	invalid_igdb_ids?: number[];
	rejected_game_ids?: string[];
	invalid_game_ids?: string[];
};

type ApiResult<T> =
	| { ok: true; data: T; status: number }
	| { ok: false; status: number; error: string };

async function playnotesFetch(
	path: string,
	init: RequestInit & { accessToken?: string | null },
): Promise<Response> {
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/json");
	if (init.accessToken) {
		headers.set("Authorization", `Bearer ${init.accessToken}`);
	}
	return fetch(`${getPlaynotesOrigin()}${path}`, {
		...init,
		headers,
		cache: "no-store",
	});
}

export async function exchangeAuthorizationCode(params: {
	code: string;
	codeVerifier: string;
	redirectUri: string;
}): Promise<ApiResult<TokenResponse>> {
	const res = await playnotesFetch(
		"/api/integrations/indie-soul-fest/oauth/token",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: INDIE_SOUL_FEST_CLIENT_ID,
				code: params.code,
				code_verifier: params.codeVerifier,
				redirect_uri: params.redirectUri,
			}),
		},
	);
	return parseJsonResult<TokenResponse>(res);
}

export async function refreshAccessToken(
	refreshToken: string,
): Promise<ApiResult<TokenResponse>> {
	const res = await playnotesFetch(
		"/api/integrations/indie-soul-fest/oauth/token",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "refresh_token",
				client_id: INDIE_SOUL_FEST_CLIENT_ID,
				refresh_token: refreshToken,
			}),
		},
	);
	return parseJsonResult<TokenResponse>(res);
}

export async function revokeTokens(params: {
	accessToken?: string | null;
	refreshToken?: string | null;
}): Promise<void> {
	try {
		await playnotesFetch("/api/integrations/indie-soul-fest/oauth/revoke", {
			method: "POST",
			accessToken: params.accessToken,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(
				params.refreshToken ? { refresh_token: params.refreshToken } : {},
			),
		});
	} catch {
		/* best-effort */
	}
}

/**
 * Obtiene un access token válido, renovando con refresh si hace falta.
 * Si el refresh falla, limpia la sesión.
 */
export async function getValidAccessToken(): Promise<string | null> {
	const access = await readAccessToken();
	if (access) return access;

	const refresh = await readRefreshToken();
	if (!refresh) return null;

	const result = await refreshAccessToken(refresh);
	if (!result.ok) {
		await clearSessionCookies();
		return null;
	}

	await applyTokenResponse(result.data);
	return result.data.access_token;
}

export async function applyTokenResponse(
	tokens: TokenResponse,
): Promise<string> {
	const user: StoredUser = {
		id: tokens.user?.id ?? "unknown",
		username: tokens.user?.username ?? null,
		avatarUrl: tokens.user?.avatar_url ?? null,
	};

	if (tokens.refresh_token) {
		return setSessionCookies({
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			accessMaxAge: Math.max(60, tokens.expires_in || 3600),
			refreshMaxAge: Math.max(3600, tokens.refresh_expires_in || 60 * 60 * 24 * 30),
			user,
		});
	}

	await rotateAccessCookie(
		tokens.access_token,
		Math.max(60, tokens.expires_in || 3600),
	);
	return "";
}

async function withAuthRetry<T>(
	fn: (accessToken: string) => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
	let access = await getValidAccessToken();
	if (!access) {
		return { ok: false, status: 401, error: "No autenticado." };
	}

	let result = await fn(access);
	if (result.ok || result.status !== 401) return result;

	const refresh = await readRefreshToken();
	if (!refresh) {
		await clearSessionCookies();
		return result;
	}

	const refreshed = await refreshAccessToken(refresh);
	if (!refreshed.ok) {
		await clearSessionCookies();
		return { ok: false, status: 401, error: "Sesión caducada." };
	}

	await applyTokenResponse(refreshed.data);
	if (refreshed.data.refresh_token) {
		await rotateRefreshCookie(
			refreshed.data.refresh_token,
			Math.max(3600, refreshed.data.refresh_expires_in || 60 * 60 * 24 * 30),
		);
	}
	access = refreshed.data.access_token;
	return fn(access);
}

export async function fetchIsfMe(): Promise<ApiResult<IsfMeResponse>> {
	return withAuthRetry(async (accessToken) => {
		const res = await playnotesFetch("/api/integrations/indie-soul-fest/me", {
			method: "GET",
			accessToken,
		});
		return parseJsonResult<IsfMeResponse>(res);
	});
}

export async function fetchIsfList(): Promise<ApiResult<IsfListResponse>> {
	return withAuthRetry(async (accessToken) => {
		const res = await playnotesFetch("/api/integrations/indie-soul-fest/list", {
			method: "GET",
			accessToken,
		});
		return parseJsonResult<IsfListResponse>(res);
	});
}

export async function importIsfList(params: {
	gameIds?: string[];
	igdbIds?: number[];
}): Promise<ApiResult<IsfImportResponse>> {
	const body: { game_ids?: string[]; igdb_ids?: number[] } = {};
	if (params.gameIds?.length) body.game_ids = params.gameIds;
	if (params.igdbIds?.length) body.igdb_ids = params.igdbIds;
	return withAuthRetry(async (accessToken) => {
		const res = await playnotesFetch(
			"/api/integrations/indie-soul-fest/list/import",
			{
				method: "POST",
				accessToken,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
		return parseJsonResult<IsfImportResponse>(res);
	});
}

export async function addIsfGame(params: {
	gameId?: string;
	igdbId?: number;
}): Promise<ApiResult<IsfListResponse & { ok?: boolean; added?: number }>> {
	return withAuthRetry(async (accessToken) => {
		const body = params.gameId
			? { game_id: params.gameId }
			: { igdb_id: params.igdbId };
		const res = await playnotesFetch(
			"/api/integrations/indie-soul-fest/list/games",
			{
				method: "POST",
				accessToken,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
		return parseJsonResult(res);
	});
}

export async function removeIsfGame(params: {
	gameId?: string;
	igdbId?: number;
}): Promise<ApiResult<IsfListResponse & { ok?: boolean; removed?: boolean }>> {
	return withAuthRetry(async (accessToken) => {
		const body = params.gameId
			? { game_id: params.gameId }
			: { igdb_id: params.igdbId };
		const res = await playnotesFetch(
			"/api/integrations/indie-soul-fest/list/games",
			{
				method: "DELETE",
				accessToken,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
		return parseJsonResult(res);
	});
}

async function parseJsonResult<T>(res: Response): Promise<ApiResult<T>> {
	let payload: unknown = null;
	try {
		payload = await res.json();
	} catch {
		payload = null;
	}
	if (!res.ok) {
		const error =
			payload &&
			typeof payload === "object" &&
			"error" in payload &&
			typeof (payload as { error: unknown }).error === "string"
				? (payload as { error: string }).error
				: `Error PlayNotes (${res.status})`;
		return { ok: false, status: res.status, error };
	}
	return { ok: true, status: res.status, data: payload as T };
}
