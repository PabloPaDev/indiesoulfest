/**
 * Contrato Indie Soul Fest × PlayNotes (BFF en Vercel).
 * @see PlayNotes docs/integrations/indie-soul-fest.md
 */

export const INDIE_SOUL_FEST_CLIENT_ID = "indie-soul-fest";

export const ISF_SCOPES = ["isf2026.list:read", "isf2026.list:write"] as const;

export const ISF_PROD_REDIRECT_URI = "https://indiesoulfest.com/oauth/callback";
export const ISF_DEV_REDIRECT_URI = "http://127.0.0.1:4310/oauth/callback";

export const COOKIE = {
	access: "isf_at",
	refresh: "isf_rt",
	csrf: "isf_csrf",
	oauthState: "isf_oauth_state",
	oauthVerifier: "isf_oauth_verifier",
	user: "isf_user",
} as const;

export function getPlaynotesOrigin(): string {
	const fromEnv = process.env.PLAYNOTES_API_ORIGIN?.trim().replace(/\/$/, "");
	if (fromEnv) return fromEnv;
	const pub = process.env.NEXT_PUBLIC_PLAYNOTES_API_ORIGIN?.trim().replace(
		/\/$/,
		"",
	);
	if (pub) return pub;
	if (process.env.NODE_ENV === "development") return "http://localhost:3000";
	return "https://www.playnotes.es";
}

export function getIsfRedirectUri(): string {
	const fromEnv = process.env.INDIE_SOUL_FEST_REDIRECT_URI?.trim();
	if (fromEnv) return fromEnv;
	if (process.env.NODE_ENV === "development") return ISF_DEV_REDIRECT_URI;
	return ISF_PROD_REDIRECT_URI;
}

export function isSecureCookies(): boolean {
	if (process.env.INDIE_SOUL_FEST_COOKIE_SECURE === "true") return true;
	if (process.env.INDIE_SOUL_FEST_COOKIE_SECURE === "false") return false;
	return process.env.NODE_ENV === "production";
}

export function playnotesAuthorizeUrl(params: {
	state: string;
	codeChallenge: string;
	redirectUri: string;
}): string {
	const url = new URL(`${getPlaynotesOrigin()}/oauth/indie-soul-fest`);
	url.searchParams.set("client_id", INDIE_SOUL_FEST_CLIENT_ID);
	url.searchParams.set("redirect_uri", params.redirectUri);
	url.searchParams.set("state", params.state);
	url.searchParams.set("code_challenge", params.codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("app_name", "Indie Soul Fest");
	return url.toString();
}
