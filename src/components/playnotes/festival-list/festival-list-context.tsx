"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { FestivalGame } from "@/types/festival-game";
import {
	FESTIVAL_LIST_NAME,
	getFestivalListLoginUrl,
	readFestivalListLocal,
	saveFestivalListToPlaynotes,
	writeFestivalListLocal,
	type FestivalListSyncResult,
} from "@/lib/playnotes/festival-list";
import { useOptionalPlaynotesSession } from "@/components/playnotes/playnotes-session-context";

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
	syncMessage: string | null;
	syncBusy: boolean;
	listName: string;
	saveToPlaynotes: () => Promise<void>;
	loginToPlaynotes: () => void;
	openGame: (id: string) => void;
};

const FestivalListContext = createContext<FestivalListContextValue | null>(null);

export function FestivalListProvider({
	games,
	onOpenGame,
	children,
}: {
	games: FestivalGame[];
	onOpenGame: (id: string) => void;
	children: ReactNode;
}) {
	const sessionCtx = useOptionalPlaynotesSession();
	const [open, setOpen] = useState(false);
	const [gameIds, setGameIds] = useState<string[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [toast, setToast] = useState<Toast | null>(null);
	const [syncMessage, setSyncMessage] = useState<string | null>(null);
	const [syncBusy, setSyncBusy] = useState(false);
	const [toastSeq, setToastSeq] = useState(0);

	const catalogById = useMemo(() => {
		const map = new Map<string, FestivalGame>();
		for (const game of games) map.set(game.id, game);
		return map;
	}, [games]);

	useEffect(() => {
		const local = readFestivalListLocal();
		const valid = local.gameIds.filter((id) => catalogById.has(id));
		setGameIds(valid);
		if (valid.length !== local.gameIds.length) {
			writeFestivalListLocal(valid);
		}
		setHydrated(true);
	}, [catalogById]);

	useEffect(() => {
		if (!hydrated) return;
		writeFestivalListLocal(gameIds);
	}, [gameIds, hydrated]);

	useEffect(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(null), 2200);
		return () => window.clearTimeout(timer);
	}, [toast]);

	const showToast = useCallback((message: string) => {
		setToastSeq((n) => {
			const id = n + 1;
			setToast({ id, message });
			return id;
		});
	}, []);

	const has = useCallback((id: string) => gameIds.includes(id), [gameIds]);

	const add = useCallback(
		(id: string) => {
			if (!catalogById.has(id)) return;
			setGameIds((prev) => {
				if (prev.includes(id)) return prev;
				return [...prev, id];
			});
			showToast("Añadido a Mi lista del festival");
		},
		[catalogById, showToast],
	);

	const remove = useCallback(
		(id: string) => {
			setGameIds((prev) => prev.filter((item) => item !== id));
			showToast("Eliminado de Mi lista del festival");
		},
		[showToast],
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

	const loginToPlaynotes = useCallback(() => {
		window.location.href = getFestivalListLoginUrl();
	}, []);

	const saveToPlaynotes = useCallback(async () => {
		setSyncBusy(true);
		setSyncMessage(null);
		const authenticated = !!sessionCtx?.session.authenticated;
		const result: FestivalListSyncResult = await saveFestivalListToPlaynotes({
			gameIds,
			authenticated,
		});
		setSyncBusy(false);
		setSyncMessage(result.message);
		if (result.state === "login-required") {
			loginToPlaynotes();
		}
	}, [gameIds, loginToPlaynotes, sessionCtx?.session.authenticated]);

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
			syncMessage,
			syncBusy,
			listName: FESTIVAL_LIST_NAME,
			saveToPlaynotes,
			loginToPlaynotes,
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
			syncMessage,
			syncBusy,
			saveToPlaynotes,
			loginToPlaynotes,
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
