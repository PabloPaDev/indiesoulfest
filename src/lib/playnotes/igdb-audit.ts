import { festivalCatalog } from "@/data/festivalCatalog";
import type { FestivalGame } from "@/types/festival-game";

export type IgdbAuditRow = {
	id: string;
	title: string | null;
	steamAppId: number | null;
	igdbId: number | null;
	playnotesGameId: string | null;
	valid: boolean;
	syncable: boolean;
};

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidIgdbId(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isValidPlaynotesGameId(value: unknown): value is string {
	return typeof value === "string" && UUID_RE.test(value.trim());
}

export function isSyncableFestivalGame(
	game: Pick<FestivalGame, "playnotesGameId"> | null | undefined,
): boolean {
	return isValidPlaynotesGameId(game?.playnotesGameId);
}

export function auditFestivalIgdbIds(
	games: FestivalGame[] = festivalCatalog,
): {
	total: number;
	valid: IgdbAuditRow[];
	missing: IgdbAuditRow[];
	syncable: IgdbAuditRow[];
	unsyncable: IgdbAuditRow[];
} {
	const rows: IgdbAuditRow[] = games.map((game) => ({
		id: game.id,
		title: game.title,
		steamAppId: game.steamAppId,
		igdbId: game.igdbId,
		playnotesGameId: game.playnotesGameId,
		valid: isValidIgdbId(game.igdbId),
		syncable: isSyncableFestivalGame(game),
	}));

	return {
		total: rows.length,
		valid: rows.filter((row) => row.valid),
		missing: rows.filter((row) => !row.valid),
		syncable: rows.filter((row) => row.syncable),
		unsyncable: rows.filter((row) => !row.syncable),
	};
}

/** Relaciona UUID PlayNotes (y fallback IGDB) con ids locales del festival. */
export function festivalGameIdsFromRemoteGames(
	games: FestivalGame[],
	remote: Array<{
		gameId?: string | null;
		igdbId?: number | null;
	}>,
): string[] {
	const byUuid = new Map<string, string>();
	const byIgdb = new Map<number, string>();
	for (const game of games) {
		if (isValidPlaynotesGameId(game.playnotesGameId)) {
			byUuid.set(game.playnotesGameId, game.id);
		}
		if (isValidIgdbId(game.igdbId)) {
			byIgdb.set(game.igdbId, game.id);
		}
	}
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of remote) {
		const festivalId =
			(isValidPlaynotesGameId(item.gameId)
				? byUuid.get(item.gameId)
				: undefined) ??
			(isValidIgdbId(item.igdbId) ? byIgdb.get(item.igdbId) : undefined);
		if (!festivalId || seen.has(festivalId)) continue;
		seen.add(festivalId);
		out.push(festivalId);
	}
	return out;
}

/** @deprecated Preferir festivalGameIdsFromRemoteGames (UUID canónico). */
export function festivalGameIdsFromRemoteIgdb(
	games: FestivalGame[],
	remoteIgdbIds: Array<number | null | undefined>,
): string[] {
	return festivalGameIdsFromRemoteGames(
		games,
		remoteIgdbIds.map((igdbId) => ({ igdbId })),
	);
}
