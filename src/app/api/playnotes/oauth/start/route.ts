import { NextResponse } from "next/server";
import {
	getIsfRedirectUri,
	playnotesAuthorizeUrl,
} from "@/lib/playnotes/oauth/config";
import { setOAuthPendingCookies } from "@/lib/playnotes/oauth/cookies";
import {
	createCodeChallenge,
	generateCodeVerifier,
	generateState,
} from "@/lib/playnotes/oauth/pkce";

export async function GET(request: Request) {
	const redirectUri = getIsfRedirectUri();
	const state = generateState();
	const verifier = generateCodeVerifier();
	const challenge = createCodeChallenge(verifier);

	await setOAuthPendingCookies({ state, verifier });

	const authorizeUrl = playnotesAuthorizeUrl({
		state,
		codeChallenge: challenge,
		redirectUri,
	});

	const wantsJson = request.headers.get("accept")?.includes("application/json");
	if (wantsJson) {
		return NextResponse.json(
			{ authorizeUrl },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	return NextResponse.redirect(authorizeUrl, { status: 302 });
}
