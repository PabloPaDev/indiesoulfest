import { promises as fs } from "fs";
import path from "path";
import {
	cleanCommentText,
	isCommentId,
	isGameId,
	type DemoCommentRecord,
} from "@/lib/demo-comments";

const FILE = path.join(process.cwd(), "data", "demo-comments.json");
const MAX_PER_GAME = 80;

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
	const run = queue.then(task, task);
	queue = run.then(
		() => undefined,
		() => undefined,
	);
	return run;
}

function isRecord(value: unknown): value is DemoCommentRecord {
	if (!value || typeof value !== "object") return false;
	const row = value as DemoCommentRecord;
	return (
		isCommentId(row.id) &&
		isGameId(row.gameId) &&
		typeof row.text === "string" &&
		row.text.length > 0 &&
		typeof row.createdAt === "string"
	);
}

async function readAll(): Promise<DemoCommentRecord[]> {
	try {
		const raw = await fs.readFile(FILE, "utf8");
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isRecord);
	} catch {
		return [];
	}
}

async function writeAll(rows: DemoCommentRecord[]): Promise<void> {
	await fs.mkdir(path.dirname(FILE), { recursive: true });
	await fs.writeFile(FILE, JSON.stringify(rows), "utf8");
}

export function listDemoComments(gameId: string): Promise<DemoCommentRecord[]> {
	return enqueue(async () => {
		const rows = await readAll();
		return rows
			.filter((row) => row.gameId === gameId)
			.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
	});
}

export function saveDemoComment(input: {
	id: string;
	gameId: string;
	text: string;
}): Promise<DemoCommentRecord> {
	return enqueue(async () => {
		const text = cleanCommentText(input.text);
		if (!text || !isCommentId(input.id) || !isGameId(input.gameId)) {
			throw new Error("invalid");
		}
		const rows = await readAll();
		const index = rows.findIndex((row) => row.id === input.id);
		if (index >= 0) {
			if (rows[index].gameId !== input.gameId) throw new Error("invalid");
			const next = { ...rows[index], text };
			rows[index] = next;
			await writeAll(rows);
			return next;
		}
		const forGame = rows.filter((row) => row.gameId === input.gameId);
		if (forGame.length >= MAX_PER_GAME) throw new Error("full");
		const created: DemoCommentRecord = {
			id: input.id,
			gameId: input.gameId,
			text,
			createdAt: new Date().toISOString(),
		};
		rows.push(created);
		await writeAll(rows);
		return created;
	});
}

export function deleteDemoComment(input: {
	id: string;
	gameId: string;
}): Promise<void> {
	return enqueue(async () => {
		if (!isCommentId(input.id) || !isGameId(input.gameId)) {
			throw new Error("invalid");
		}
		const rows = await readAll();
		await writeAll(
			rows.filter((row) => !(row.id === input.id && row.gameId === input.gameId)),
		);
	});
}
