/** Persistencia local de la lista del festival (invitado + por cuenta). */

export const LEGACY_FESTIVAL_LIST_STORAGE_KEY = "isf.playnotes.festival-list.v1";
export const GUEST_FESTIVAL_LIST_STORAGE_KEY = "isf.festival-list.guest.v1";
export const WELCOME_SEEN_STORAGE_KEY = "isf.welcome.seen.v1";
export const IMPORT_DONE_PREFIX = "isf.festival-list.imported.";
export const PENDING_OPS_PREFIX = "isf.festival-list.pending.";

export type FestivalListSnapshot = {
	gameIds: string[];
	updatedAt: string;
};

export type PendingListOp = {
	id: string;
	type: "add" | "remove";
	/** Id local del festival (catálogo). */
	gameId: string;
	/** UUID canónico en PlayNotes (preferido para sync). */
	playnotesGameId: string | null;
	/** Compat con colas pendientes anteriores a la migración UUID. */
	igdbId: number | null;
	at: string;
};

function emptySnapshot(): FestivalListSnapshot {
	return { gameIds: [], updatedAt: new Date(0).toISOString() };
}

function userListKey(userId: string): string {
	return `isf.festival-list.user.${userId}.v1`;
}

export function storageKeyForAccount(userId: string | null): string {
	return userId ? userListKey(userId) : GUEST_FESTIVAL_LIST_STORAGE_KEY;
}

function parseSnapshot(raw: string | null): FestivalListSnapshot {
	if (!raw) return emptySnapshot();
	try {
		const parsed = JSON.parse(raw) as Partial<FestivalListSnapshot>;
		const gameIds = Array.isArray(parsed.gameIds)
			? parsed.gameIds.filter((id): id is string => typeof id === "string")
			: [];
		return {
			gameIds,
			updatedAt:
				typeof parsed.updatedAt === "string"
					? parsed.updatedAt
					: new Date().toISOString(),
		};
	} catch {
		return emptySnapshot();
	}
}

/** Migra la clave legacy a la de invitado (una sola vez). */
export function migrateLegacyGuestList(): void {
	if (typeof window === "undefined") return;
	try {
		const legacy = window.localStorage.getItem(LEGACY_FESTIVAL_LIST_STORAGE_KEY);
		if (!legacy) return;
		const existing = window.localStorage.getItem(GUEST_FESTIVAL_LIST_STORAGE_KEY);
		if (!existing) {
			window.localStorage.setItem(GUEST_FESTIVAL_LIST_STORAGE_KEY, legacy);
		}
		window.localStorage.removeItem(LEGACY_FESTIVAL_LIST_STORAGE_KEY);
	} catch {
		/* ignore */
	}
}

export function readFestivalListLocal(
	userId: string | null = null,
): FestivalListSnapshot {
	if (typeof window === "undefined") return emptySnapshot();
	migrateLegacyGuestList();
	try {
		return parseSnapshot(
			window.localStorage.getItem(storageKeyForAccount(userId)),
		);
	} catch {
		return emptySnapshot();
	}
}

export function writeFestivalListLocal(
	gameIds: string[],
	userId: string | null = null,
): FestivalListSnapshot {
	const snapshot: FestivalListSnapshot = {
		gameIds,
		updatedAt: new Date().toISOString(),
	};
	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(
				storageKeyForAccount(userId),
				JSON.stringify(snapshot),
			);
		} catch {
			/* ignore quota */
		}
	}
	return snapshot;
}

export function hasImportedGuestList(userId: string): boolean {
	if (typeof window === "undefined") return true;
	try {
		return window.localStorage.getItem(`${IMPORT_DONE_PREFIX}${userId}`) === "1";
	} catch {
		return false;
	}
}

export function markGuestListImported(userId: string): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(`${IMPORT_DONE_PREFIX}${userId}`, "1");
	} catch {
		/* ignore */
	}
}

export function readPendingOps(userId: string): PendingListOp[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(`${PENDING_OPS_PREFIX}${userId}`);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter((item): item is PendingListOp => {
				if (!item || typeof item !== "object") return false;
				const op = item as PendingListOp;
				return (
					(op.type === "add" || op.type === "remove") &&
					typeof op.gameId === "string" &&
					typeof op.id === "string"
				);
			})
			.map((op) => ({
				...op,
				playnotesGameId:
					typeof op.playnotesGameId === "string" ? op.playnotesGameId : null,
				igdbId:
					typeof op.igdbId === "number" && Number.isInteger(op.igdbId)
						? op.igdbId
						: null,
			}));
	} catch {
		return [];
	}
}

export function writePendingOps(userId: string, ops: PendingListOp[]): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(
			`${PENDING_OPS_PREFIX}${userId}`,
			JSON.stringify(ops),
		);
	} catch {
		/* ignore */
	}
}

export function enqueuePendingOp(
	userId: string,
	op: Omit<PendingListOp, "id" | "at">,
): PendingListOp[] {
	const nextOp: PendingListOp = {
		...op,
		id: `${op.type}-${op.gameId}-${Date.now()}`,
		at: new Date().toISOString(),
	};
	const existing = readPendingOps(userId).filter(
		(item) => !(item.gameId === op.gameId && item.type === op.type),
	);
	// Si hay operación contraria pendiente, se anulan.
	const withoutOpposite = existing.filter(
		(item) =>
			!(
				item.gameId === op.gameId &&
				((op.type === "add" && item.type === "remove") ||
					(op.type === "remove" && item.type === "add"))
			),
	);
	const hadOpposite = withoutOpposite.length !== existing.length;
	const next = hadOpposite ? withoutOpposite : [...withoutOpposite, nextOp];
	writePendingOps(userId, next);
	return next;
}

export function mergeGameIds(...lists: string[][]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const list of lists) {
		for (const id of list) {
			if (seen.has(id)) continue;
			seen.add(id);
			out.push(id);
		}
	}
	return out;
}

export function hasSeenWelcome(): boolean {
	if (typeof window === "undefined") return true;
	try {
		return window.localStorage.getItem(WELCOME_SEEN_STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

export function markWelcomeSeen(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(WELCOME_SEEN_STORAGE_KEY, "1");
	} catch {
		/* ignore */
	}
}
