import { NextResponse } from "next/server";
import { getIsfRedirectUri } from "@/lib/playnotes/oauth/config";
import {
	clearOAuthPendingCookies,
	readOAuthPendingCookies,
} from "@/lib/playnotes/oauth/cookies";
import {
	applyTokenResponse,
	exchangeAuthorizationCode,
} from "@/lib/playnotes/oauth/playnotes-api";

function festivalRedirect(request: Request, query: Record<string, string>) {
	const url = new URL("/festival", request.url);
	for (const [key, value] of Object.entries(query)) {
		url.searchParams.set(key, value);
	}
	return NextResponse.redirect(url, { status: 302 });
}

export async function GET(request: Request) {
	const incoming = new URL(request.url);
	const error = incoming.searchParams.get("error");
	const code = incoming.searchParams.get("code");
	const state = incoming.searchParams.get("state");

	if (error) {
		await clearOAuthPendingCookies();
		return festivalRedirect(request, {
			playnotes: "error",
			reason: error.slice(0, 80),
		});
	}

	if (!code || !state) {
		await clearOAuthPendingCookies();
		return festivalRedirect(request, {
			playnotes: "error",
			reason: "missing_code",
		});
	}

	const pending = await readOAuthPendingCookies();
	if (!pending.state || !pending.verifier || pending.state !== state) {
		await clearOAuthPendingCookies();
		return festivalRedirect(request, {
			playnotes: "error",
			reason: "invalid_state",
		});
	}

	const redirectUri = getIsfRedirectUri();
	const tokens = await exchangeAuthorizationCode({
		code,
		codeVerifier: pending.verifier,
		redirectUri,
	});

	await clearOAuthPendingCookies();

	if (!tokens.ok) {
		return festivalRedirect(request, {
			playnotes: "error",
			reason: "token_exchange",
		});
	}

	await applyTokenResponse(tokens.data);

	return festivalRedirect(request, {
		playnotes: "connected",
		import: "1",
	});
}
