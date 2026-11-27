import {
	clearSessionCookies,
	readCsrfToken,
	readStoredUser,
} from "@/lib/playnotes/oauth/cookies";
import { generateCsrfToken } from "@/lib/playnotes/oauth/pkce";
import {
	fetchIsfMe,
	getValidAccessToken,
} from "@/lib/playnotes/oauth/playnotes-api";
import { jsonNoStore } from "@/lib/playnotes/oauth/csrf";
import { COOKIE, isSecureCookies } from "@/lib/playnotes/oauth/config";
import { cookies } from "next/headers";

export async function GET() {
	const access = await getValidAccessToken();
	if (!access) {
		return jsonNoStore({
			authenticated: false,
			user: null,
			csrfToken: null,
		});
	}

	const me = await fetchIsfMe();
	if (!me.ok) {
		if (me.status === 401) {
			await clearSessionCookies();
		}
		return jsonNoStore({
			authenticated: false,
			user: null,
			csrfToken: null,
			error: me.error,
		});
	}

	let csrf = await readCsrfToken();
	if (!csrf) {
		csrf = generateCsrfToken();
		const store = await cookies();
		store.set(COOKIE.csrf, csrf, {
			httpOnly: true,
			secure: isSecureCookies(),
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
		});
	}

	const cached = await readStoredUser();
	const user = {
		id: me.data.user.id,
		username: me.data.user.username ?? cached?.username ?? null,
		avatarUrl: me.data.user.avatar_url ?? cached?.avatarUrl ?? null,
	};

	const store = await cookies();
	store.set(COOKIE.user, JSON.stringify(user), {
		httpOnly: true,
		secure: isSecureCookies(),
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
	});

	return jsonNoStore({
		authenticated: true,
		user,
		scopes: me.data.scopes,
		deviceId: me.data.deviceId,
		csrfToken: csrf,
	});
}
