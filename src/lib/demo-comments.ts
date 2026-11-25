export const DEMO_COMMENT_MAX_LENGTH = 400;

export type DemoComment = {
	id: string;
	text: string;
	createdAt: string;
};

export type DemoCommentRecord = DemoComment & {
	gameId: string;
};

const GAME_ID = /^[a-z0-9-]{1,80}$/;
const COMMENT_ID = /^[0-9a-f-]{8,80}$/i;

export function isGameId(value: unknown): value is string {
	return typeof value === "string" && GAME_ID.test(value);
}

export function isCommentId(value: unknown): value is string {
	return typeof value === "string" && COMMENT_ID.test(value);
}

export function cleanCommentText(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const text = value.replace(/\s+/g, " ").trim().slice(0, DEMO_COMMENT_MAX_LENGTH);
	return text || null;
}
