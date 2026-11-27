import { requireCsrf, jsonNoStore } from "@/lib/playnotes/oauth/csrf";
import { importIsfList } from "@/lib/playnotes/oauth/playnotes-api";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
	const csrfError = await requireCsrf(request);
	if (csrfError) return csrfError;

	let body: {
		game_ids?: unknown;
		gameIds?: unknown;
		igdb_ids?: unknown;
		igdbIds?: unknown;
	};
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return jsonNoStore({ error: "JSON inválido." }, { status: 400 });
	}

	const rawGameIds = body.game_ids ?? body.gameIds ?? [];
	const rawIgdbIds = body.igdb_ids ?? body.igdbIds ?? [];

	if (!Array.isArray(rawGameIds) || !Array.isArray(rawIgdbIds)) {
		return jsonNoStore(
			{ error: "game_ids e igdb_ids deben ser arrays." },
			{ status: 400 },
		);
	}

	const gameIds = rawGameIds
		.filter((value): value is string => typeof value === "string")
		.map((value) => value.trim())
		.filter((value) => UUID_RE.test(value))
		.slice(0, 100);

	const igdbIds = rawIgdbIds
		.map((value) => Number(value))
		.filter((value) => Number.isInteger(value) && value > 0)
		.slice(0, 100);

	if (!gameIds.length && !igdbIds.length) {
		return jsonNoStore(
			{ error: "Debes indicar game_ids (preferido) o igdb_ids." },
			{ status: 400 },
		);
	}

	const result = await importIsfList({ gameIds, igdbIds });
	if (!result.ok) {
		return jsonNoStore({ error: result.error }, { status: result.status });
	}
	return jsonNoStore(result.data);
}
