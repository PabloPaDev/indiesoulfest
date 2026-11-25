import { isCommentId } from "@/lib/demo-comments";

const STORAGE_KEY = "isf.demo-reviews.v1";

type LocalReview = {
	id: string;
	text: string;
};

type LocalStore = Record<string, Partial<LocalReview>>;

function readStore(): LocalStore {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as LocalStore;
		if (!parsed || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}

function writeStore(store: LocalStore): void {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function readLocalReview(gameId: string): LocalReview | null {
	const entry = readStore()[gameId];
	if (!entry || typeof entry.text !== "string" || !isCommentId(entry.id)) return null;
	const text = entry.text.trim();
	if (!text) return null;
	return { id: entry.id, text };
}

export function writeLocalReview(gameId: string, review: LocalReview | null): void {
	if (typeof window === "undefined") return;
	const store = readStore();
	if (!review) {
		delete store[gameId];
	} else {
		store[gameId] = review;
	}
	writeStore(store);
}

export function createCommentId(): string {
	return crypto.randomUUID();
}
