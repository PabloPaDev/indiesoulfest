"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import {
	fetchFestivalSession,
	fetchLibraryStatuses,
	type FestivalLibraryStatus,
	type FestivalSession,
} from "@/lib/playnotes/festival-api";

type LibraryMap = Record<string, FestivalLibraryStatus>;

type PlaynotesSessionContextValue = {
	session: FestivalSession;
	ready: boolean;
	libraryByGameId: LibraryMap;
	libraryByIgdbId: LibraryMap;
	refreshSession: () => Promise<void>;
	loadStatuses: (params: {
		gameIds?: string[];
		igdbIds?: number[];
	}) => Promise<void>;
	patchStatus: (row: FestivalLibraryStatus) => void;
};

const PlaynotesSessionContext = createContext<PlaynotesSessionContextValue | null>(
	null,
);

function keyForIgdb(id: number | null | undefined): string | null {
	if (id == null || !Number.isFinite(id)) return null;
	return String(id);
}

export function PlaynotesSessionProvider({
	children,
	gameIds = [],
	igdbIds = [],
}: {
	children: ReactNode;
	gameIds?: string[];
	igdbIds?: number[];
}) {
	const [session, setSession] = useState<FestivalSession>({
		authenticated: false,
		userId: null,
		username: null,
	});
	const [ready, setReady] = useState(false);
	const [libraryByGameId, setLibraryByGameId] = useState<LibraryMap>({});
	const [libraryByIgdbId, setLibraryByIgdbId] = useState<LibraryMap>({});

	const refreshSession = useCallback(async () => {
		const next = await fetchFestivalSession();
		setSession(next);
	}, []);

	const loadStatuses = useCallback(
		async (params: { gameIds?: string[]; igdbIds?: number[] }) => {
			const result = await fetchLibraryStatuses(params);
			if (!result.authenticated) {
				setLibraryByGameId({});
				setLibraryByIgdbId({});
				return;
			}
			setLibraryByGameId((prev) => {
				const next = { ...prev };
				for (const row of result.games) next[row.gameId] = row;
				return next;
			});
			setLibraryByIgdbId((prev) => {
				const next = { ...prev };
				for (const row of result.games) {
					const key = keyForIgdb(row.igdbId);
					if (key) next[key] = row;
				}
				return next;
			});
		},
		[],
	);

	const patchStatus = useCallback((row: FestivalLibraryStatus) => {
		setLibraryByGameId((prev) => ({ ...prev, [row.gameId]: row }));
		const key = keyForIgdb(row.igdbId);
		if (key) {
			setLibraryByIgdbId((prev) => ({ ...prev, [key]: row }));
		}
	}, []);

	const gameIdsKey = gameIds.join(",");
	const igdbIdsKey = igdbIds.join(",");

	useEffect(() => {
		let cancelled = false;
		(async () => {
			await refreshSession();
			if (cancelled) return;
			if (gameIds.length || igdbIds.length) {
				await loadStatuses({ gameIds, igdbIds });
			}
			if (!cancelled) setReady(true);
		})();
		return () => {
			cancelled = true;
		};
	}, [gameIdsKey, igdbIdsKey, loadStatuses, refreshSession]);

	return (
		<PlaynotesSessionContext.Provider
			value={{
				session,
				ready,
				libraryByGameId,
				libraryByIgdbId,
				refreshSession,
				loadStatuses,
				patchStatus,
			}}
		>
			{children}
		</PlaynotesSessionContext.Provider>
	);
}

export function usePlaynotesSession() {
	const ctx = useContext(PlaynotesSessionContext);
	if (!ctx) {
		throw new Error("usePlaynotesSession debe usarse dentro de PlaynotesSessionProvider");
	}
	return ctx;
}

export function useOptionalPlaynotesSession() {
	return useContext(PlaynotesSessionContext);
}
