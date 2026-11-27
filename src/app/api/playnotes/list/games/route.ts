import { requireCsrf, jsonNoStore } from "@/lib/playnotes/oauth/csrf";
import { addIsfGame, removeIsfGame } from "@/lib/playnotes/oauth/playnotes-api";

type Body = {
	game_id?: unknown;
	gameId?: unknown;
	igdb_id?: unknown;
	igdbId?: unknown;
};

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(body: Body): { gameId?: string; igdbId?: number } | null {
	const rawGame = body.game_id ?? body.gameId;
	const rawIgdb = body.igdb_id ?? body.igdbId;
	const gameId =
		typeof rawGame === "string" && UUID_RE.test(rawGame.trim())
			? rawGame.trim()
			: undefined;
	const igdbId =
		rawIgdb == null ? undefined : Number(rawIgdb);

	// Preferir UUID canónico de PlayNotes.
	if (gameId) return { gameId };
	if (igdbId != null && Number.isInteger(igdbId) && igdbId > 0) {
		return { igdbId };
	}
	return null;
}

export async function POST(request: Request) {
	const csrfError = await requireCsrf(request);
	if (csrfError) return csrfError;

	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return jsonNoStore({ error: "JSON inválido." }, { status: 400 });
	}

	const parsed = parseBody(body);
	if (!parsed) {
		return jsonNoStore(
			{ error: "Debes indicar game_id (preferido) o igdb_id." },
			{ status: 400 },
		);
	}

	const result = await addIsfGame(parsed);
	if (!result.ok) {
		return jsonNoStore({ error: result.error }, { status: result.status });
	}
	return jsonNoStore(result.data);
}

export async function DELETE(request: Request) {
	const csrfError = await requireCsrf(request);
	if (csrfError) return csrfError;

	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return jsonNoStore({ error: "JSON inválido." }, { status: 400 });
	}

	const parsed = parseBody(body);
	if (!parsed) {
		return jsonNoStore(
			{ error: "Debes indicar game_id (preferido) o igdb_id." },
			{ status: 400 },
		);
	}

	const result = await removeIsfGame(parsed);
	if (!result.ok) {
		return jsonNoStore({ error: result.error }, { status: result.status });
	}
	return jsonNoStore(result.data);
}
