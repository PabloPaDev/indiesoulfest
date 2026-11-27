import "server-only";

import { cookies } from "next/headers";
import { COOKIE, isSecureCookies } from "@/lib/playnotes/oauth/config";
import { generateCsrfToken } from "@/lib/playnotes/oauth/pkce";

export type StoredUser = {
	id: string;
	username: string | null;
	avatarUrl: string | null;
};

type CookieOpts = {
	httpOnly: boolean;
	secure: boolean;
	sameSite: "lax" | "strict";
	path: string;
	maxAge: number;
};

function baseOpts(maxAge: number, sameSite: "lax" | "strict" = "lax"): CookieOpts {
	return {
		httpOnly: true,
		secure: isSecureCookies(),
		sameSite,
		path: "/",
		maxAge,
	};
}

export async function setOAuthPendingCookies(params: {
	state: string;
	verifier: string;
}): Promise<void> {
	const store = await cookies();
	const opts = baseOpts(60 * 10);
	store.set(COOKIE.oauthState, params.state, opts);
	store.set(COOKIE.oauthVerifier, params.verifier, opts);
}

export async function readOAuthPendingCookies(): Promise<{
	state: string | null;
	verifier: string | null;
}> {
	const store = await cookies();
	return {
		state: store.get(COOKIE.oauthState)?.value ?? null,
		verifier: store.get(COOKIE.oauthVerifier)?.value ?? null,
	};
}

export async function clearOAuthPendingCookies(): Promise<void> {
	const store = await cookies();
	store.delete(COOKIE.oauthState);
	store.delete(COOKIE.oauthVerifier);
}

export async function setSessionCookies(params: {
	accessToken: string;
	refreshToken: string;
	accessMaxAge: number;
	refreshMaxAge: number;
	user: StoredUser;
}): Promise<string> {
	const store = await cookies();
	const csrf = generateCsrfToken();

	store.set(COOKIE.access, params.accessToken, baseOpts(params.accessMaxAge));
	store.set(COOKIE.refresh, params.refreshToken, baseOpts(params.refreshMaxAge));
	store.set(COOKIE.csrf, csrf, baseOpts(params.refreshMaxAge));
	store.set(
		COOKIE.user,
		JSON.stringify(params.user),
		baseOpts(params.refreshMaxAge),
	);

	return csrf;
}

export async function clearSessionCookies(): Promise<void> {
	const store = await cookies();
	store.delete(COOKIE.access);
	store.delete(COOKIE.refresh);
	store.delete(COOKIE.csrf);
	store.delete(COOKIE.user);
	store.delete(COOKIE.oauthState);
	store.delete(COOKIE.oauthVerifier);
}

export async function readAccessToken(): Promise<string | null> {
	const store = await cookies();
	return store.get(COOKIE.access)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
	const store = await cookies();
	return store.get(COOKIE.refresh)?.value ?? null;
}

export async function readCsrfToken(): Promise<string | null> {
	const store = await cookies();
	return store.get(COOKIE.csrf)?.value ?? null;
}

export async function readStoredUser(): Promise<StoredUser | null> {
	const store = await cookies();
	const raw = store.get(COOKIE.user)?.value;
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<StoredUser>;
		if (typeof parsed.id !== "string" || !parsed.id) return null;
		return {
			id: parsed.id,
			username: typeof parsed.username === "string" ? parsed.username : null,
			avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
		};
	} catch {
		return null;
	}
}

export async function rotateAccessCookie(
	accessToken: string,
	accessMaxAge: number,
): Promise<void> {
	const store = await cookies();
	store.set(COOKIE.access, accessToken, baseOpts(accessMaxAge));
}

export async function rotateRefreshCookie(
	refreshToken: string,
	refreshMaxAge: number,
): Promise<void> {
	const store = await cookies();
	store.set(COOKIE.refresh, refreshToken, baseOpts(refreshMaxAge));
}

/**
 * CSRF: el cliente debe enviar el mismo valor en X-CSRF-Token.
 * La cookie es httpOnly; el token se entrega vía GET /api/playnotes/session.
 */
export async function assertCsrf(request: Request): Promise<boolean> {
	const expected = await readCsrfToken();
	if (!expected) return false;
	const got = request.headers.get("x-csrf-token");
	if (!got || got.length < 16) return false;
	if (got.length !== expected.length) return false;
	let mismatch = 0;
	for (let i = 0; i < expected.length; i += 1) {
		mismatch |= expected.charCodeAt(i) ^ got.charCodeAt(i);
	}
	return mismatch === 0;
}
