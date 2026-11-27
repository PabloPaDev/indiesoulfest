"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import type { FestivalGame } from "@/types/festival-game";
import {
	FESTIVAL_LIST_NAME,
	getPlaynotesListUrl,
	readPlaynotesListId,
	syncStatusLabel,
	type SyncStatus,
} from "@/lib/playnotes/festival-list";
import {
	enqueuePendingOp,
	hasImportedGuestList,
	markGuestListImported,
	mergeGameIds,
	readFestivalListLocal,
	readPendingOps,
	writeFestivalListLocal,
	writePendingOps,
} from "@/lib/playnotes/festival-list-storage";
import {
	addRemoteFestivalGame,
	fetchPlaynotesSession,
	fetchRemoteFestivalList,
	importRemoteFestivalList,
	clearPlaynotesConnectLock,
	logoutPlaynotes,
	removeRemoteFestivalGame,
	startPlaynotesConnect,
	type PlaynotesAuthUser,
} from "@/lib/playnotes/bff-client";
import {
	festivalGameIdsFromRemoteGames,
	isSyncableFestivalGame,
	isValidIgdbId,
	isValidPlaynotesGameId,
} from "@/lib/playnotes/igdb-audit";

type Toast = {
	id: number;
	message: string;
};

type FestivalListContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggleOpen: () => void;
	gameIds: string[];
	totalAvailable: number;
	gamesInList: FestivalGame[];
	has: (id: string) => boolean;
	add: (id: string) => void;
	remove: (id: string) => void;
	toggle: (id: string) => void;
	toast: Toast | null;
	syncStatus: SyncStatus;
	syncStatusLabel: string;
	listName: string;
	authenticated: boolean;
	user: PlaynotesAuthUser | null;
	ready: boolean;
	connectToPlaynotes: () => void;
	disconnectPlaynotes: () => Promise<void>;
	listUrl: string | null;
	openGame: (id: string) => void;
};

const FestivalListContext = createContext<FestivalListContextValue | null>(null);

function remoteParamsForGame(game: FestivalGame): {
	gameId?: string;
	igdbId?: number;
} | null {
	if (isValidPlaynotesGameId(game.playnotesGameId)) {
		return { gameId: game.playnotesGameId };
	}
	if (isValidIgdbId(game.igdbId)) {
		return { igdbId: game.igdbId };
	}
	return null;
}

export function FestivalListProvider({
	games,
	onOpenGame,
	children,
}: {
	games: FestivalGame[];
	onOpenGame: (id: string) => void;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [gameIds, setGameIds] = useState<string[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [toast, setToast] = useState<Toast | null>(null);
	const [toastSeq, setToastSeq] = useState(0);
	const [ready, setReady] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const [user, setUser] = useState<PlaynotesAuthUser | null>(null);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);
	const [syncStatus, setSyncStatus] = useState<SyncStatus>("guest");
	const [remoteListId, setRemoteListId] = useState<string | null>(null);
	const syncLock = useRef(false);

	const catalogById = useMemo(() => {
		const map = new Map<string, FestivalGame>();
		for (const game of games) map.set(game.id, game);
		return map;
	}, [games]);

	const noteRemoteList = useCallback(
		(data: { list?: { id?: string | null } | null } | null | undefined) => {
			const id = readPlaynotesListId(data);
			if (id) setRemoteListId(id);
		},
		[],
	);

	const showToast = useCallback((message: string) => {
		setToastSeq((n) => {
			const id = n + 1;
			setToast({ id, message });
			return id;
		});
	}, []);

	const persistLocal = useCallback(
		(ids: string[], userId: string | null) => {
			const valid = ids.filter((id) => catalogById.has(id));
			writeFestivalListLocal(valid, userId);
			return valid;
		},
		[catalogById],
	);

	const mapRemoteToLocal = useCallback(
		(remoteGames: Array<{ gameId?: string | null; igdbId?: number | null }>) =>
			festivalGameIdsFromRemoteGames(games, remoteGames),
		[games],
	);

	const flushPending = useCallback(
		async (userId: string, token: string) => {
			const ops = readPendingOps(userId);
			if (!ops.length) return true;
			const remaining = [];
			let allOk = true;
			for (const op of ops) {
				const catalogGame = catalogById.get(op.gameId);
				const gameId =
					(isValidPlaynotesGameId(op.playnotesGameId)
						? op.playnotesGameId
						: null) ??
					(isValidPlaynotesGameId(catalogGame?.playnotesGameId)
						? catalogGame!.playnotesGameId
						: null);
				const igdbId =
					isValidIgdbId(op.igdbId)
						? op.igdbId
						: isValidIgdbId(catalogGame?.igdbId)
							? catalogGame!.igdbId
							: null;

				if (!gameId && !igdbId) {
					continue;
				}

				const params = gameId ? { gameId } : { igdbId: igdbId! };
				const result =
					op.type === "add"
						? await addRemoteFestivalGame(token, params)
						: await removeRemoteFestivalGame(token, params);
				if (!result.ok) {
					remaining.push(op);
					allOk = false;
				}
			}
			writePendingOps(userId, remaining);
			return allOk;
		},
		[catalogById],
	);

	const bootstrapConnected = useCallback(
		async (sessionUser: PlaynotesAuthUser, token: string, shouldImport: boolean) => {
			if (syncLock.current) return;
			syncLock.current = true;
			try {
				const guest = readFestivalListLocal(null);
				const accountLocal = readFestivalListLocal(sessionUser.id);

				if (shouldImport && !hasImportedGuestList(sessionUser.id)) {
					const guestPlaynotesIds = guest.gameIds
						.map((id) => catalogById.get(id)?.playnotesGameId)
						.filter(isValidPlaynotesGameId);

					if (guestPlaynotesIds.length > 0) {
						const imported = await importRemoteFestivalList(token, {
							gameIds: guestPlaynotesIds,
						});
						if (!imported.ok) {
							setSyncStatus("pending");
							const merged = mergeGameIds(accountLocal.gameIds, guest.gameIds);
							setGameIds(persistLocal(merged, sessionUser.id));
							return;
						}
						noteRemoteList(imported.data);
					}
					markGuestListImported(sessionUser.id);
				}

				const pendingOk = await flushPending(sessionUser.id, token);
				const remote = await fetchRemoteFestivalList();
				if (!remote.ok || !remote.data) {
					setSyncStatus("pending");
					const fallback = mergeGameIds(accountLocal.gameIds, guest.gameIds);
					setGameIds(persistLocal(fallback, sessionUser.id));
					return;
				}

				noteRemoteList(remote.data);
				const remoteIds = mapRemoteToLocal(remote.data.games);
				const next = mergeGameIds(
					remoteIds,
					shouldImport ? guest.gameIds.filter((id) => {
						const game = catalogById.get(id);
						return game != null && !isSyncableFestivalGame(game);
					}) : [],
				);
				setGameIds(persistLocal(next, sessionUser.id));
				setSyncStatus(pendingOk ? "synced" : "pending");
			} finally {
				syncLock.current = false;
			}
		},
		[catalogById, flushPending, mapRemoteToLocal, noteRemoteList, persistLocal],
	);

	useEffect(() => {
		let cancelled = false;
		clearPlaynotesConnectLock();
		(async () => {
			const params = new URLSearchParams(window.location.search);
			const justConnected = params.get("playnotes") === "connected";
			const shouldImport = params.get("import") === "1" || justConnected;

			const session = await fetchPlaynotesSession();
			if (cancelled) return;

			if (session.authenticated && session.user) {
				setAuthenticated(true);
				setUser(session.user);
				setCsrfToken(session.csrfToken);
				await bootstrapConnected(
					session.user,
					session.csrfToken || "",
					shouldImport,
				);
			} else {
				const local = readFestivalListLocal(null);
				const valid = local.gameIds.filter((id) => catalogById.has(id));
				setGameIds(valid);
				if (valid.length !== local.gameIds.length) {
					writeFestivalListLocal(valid, null);
				}
				setSyncStatus("guest");
			}

			if (justConnected || params.get("playnotes") === "error") {
				const url = new URL(window.location.href);
				url.searchParams.delete("playnotes");
				url.searchParams.delete("import");
				url.searchParams.delete("reason");
				window.history.replaceState({}, "", url.pathname + url.search);
			}

			if (!cancelled) {
				setHydrated(true);
				setReady(true);
			}
		})();
		return () => {
			cancelled = true;
		};
		// Solo al montar: evita re-bootstrap / re-navegaciones en bucle.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		writeFestivalListLocal(gameIds, authenticated ? user?.id ?? null : null);
	}, [gameIds, hydrated, authenticated, user?.id]);

	useEffect(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(null), 2200);
		return () => window.clearTimeout(timer);
	}, [toast]);

	const has = useCallback((id: string) => gameIds.includes(id), [gameIds]);

	const syncAdd = useCallback(
		async (game: FestivalGame) => {
			if (!authenticated || !user || !csrfToken) return;
			const params = remoteParamsForGame(game);
			if (!params) return;
			const result = await addRemoteFestivalGame(csrfToken, params);
			if (result.ok) noteRemoteList(result.data);
			if (!result.ok) {
				enqueuePendingOp(user.id, {
					type: "add",
					gameId: game.id,
					playnotesGameId: game.playnotesGameId,
					igdbId: game.igdbId,
				});
				setSyncStatus("pending");
				return;
			}
			setSyncStatus(
				readPendingOps(user.id).length > 0 ? "pending" : "synced",
			);
		},
		[authenticated, csrfToken, noteRemoteList, user],
	);

	const syncRemove = useCallback(
		async (game: FestivalGame) => {
			if (!authenticated || !user || !csrfToken) return;
			const params = remoteParamsForGame(game);
			if (!params) return;
			const result = await removeRemoteFestivalGame(csrfToken, params);
			if (result.ok) noteRemoteList(result.data);
			if (!result.ok) {
				enqueuePendingOp(user.id, {
					type: "remove",
					gameId: game.id,
					playnotesGameId: game.playnotesGameId,
					igdbId: game.igdbId,
				});
				setSyncStatus("pending");
				return;
			}
			setSyncStatus(
				readPendingOps(user.id).length > 0 ? "pending" : "synced",
			);
		},
		[authenticated, csrfToken, noteRemoteList, user],
	);

	const add = useCallback(
		(id: string) => {
			const game = catalogById.get(id);
			if (!game) return;
			setGameIds((prev) => {
				if (prev.includes(id)) return prev;
				return [...prev, id];
			});
			showToast("Añadido a Mi lista del festival");
			void syncAdd(game);
		},
		[catalogById, showToast, syncAdd],
	);

	const remove = useCallback(
		(id: string) => {
			const game = catalogById.get(id);
			setGameIds((prev) => prev.filter((item) => item !== id));
			showToast("Eliminado de Mi lista del festival");
			if (game) void syncRemove(game);
		},
		[catalogById, showToast, syncRemove],
	);

	const toggle = useCallback(
		(id: string) => {
			if (has(id)) remove(id);
			else add(id);
		},
		[add, has, remove],
	);

	const gamesInList = useMemo(
		() =>
			gameIds
				.map((id) => catalogById.get(id))
				.filter((game): game is FestivalGame => !!game),
		[catalogById, gameIds],
	);

	const connectToPlaynotes = useCallback(() => {
		startPlaynotesConnect();
	}, []);

	const disconnectPlaynotes = useCallback(async () => {
		if (csrfToken) {
			await logoutPlaynotes(csrfToken);
		}
		setAuthenticated(false);
		setUser(null);
		setCsrfToken(null);
		setRemoteListId(null);
		const guest = readFestivalListLocal(null);
		setGameIds(guest.gameIds.filter((id) => catalogById.has(id)));
		setSyncStatus("guest");
		showToast("Desconectado de PlayNotes");
	}, [catalogById, csrfToken, showToast]);

	const value = useMemo<FestivalListContextValue>(
		() => ({
			open,
			setOpen,
			toggleOpen: () => setOpen((v) => !v),
			gameIds,
			totalAvailable: games.length,
			gamesInList,
			has,
			add,
			remove,
			toggle,
			toast,
			syncStatus,
			syncStatusLabel: syncStatusLabel(syncStatus),
			listName: FESTIVAL_LIST_NAME,
			authenticated,
			user,
			ready,
			connectToPlaynotes,
			disconnectPlaynotes,
			listUrl: remoteListId ? getPlaynotesListUrl(remoteListId) : null,
			openGame: onOpenGame,
		}),
		[
			open,
			gameIds,
			games.length,
			gamesInList,
			has,
			add,
			remove,
			toggle,
			toast,
			syncStatus,
			authenticated,
			user,
			ready,
			connectToPlaynotes,
			disconnectPlaynotes,
			remoteListId,
			onOpenGame,
		],
	);

	return (
		<FestivalListContext.Provider value={value}>
			{children}
		</FestivalListContext.Provider>
	);
}

export function useFestivalList() {
	const ctx = useContext(FestivalListContext);
	if (!ctx) {
		throw new Error("useFestivalList debe usarse dentro de FestivalListProvider");
	}
	return ctx;
}

export function useOptionalFestivalList() {
	return useContext(FestivalListContext);
}
