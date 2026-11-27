import {
	clearSessionCookies,
	readAccessToken,
	readRefreshToken,
} from "@/lib/playnotes/oauth/cookies";
import { requireCsrf, jsonNoStore } from "@/lib/playnotes/oauth/csrf";
import { revokeTokens } from "@/lib/playnotes/oauth/playnotes-api";

export async function POST(request: Request) {
	const csrfError = await requireCsrf(request);
	if (csrfError) return csrfError;

	const accessToken = await readAccessToken();
	const refreshToken = await readRefreshToken();
	await revokeTokens({ accessToken, refreshToken });
	await clearSessionCookies();

	return jsonNoStore({ ok: true });
}
