import { NextResponse } from "next/server";
import { isCommentId, isGameId } from "@/lib/demo-comments";
import {
	deleteDemoComment,
	listDemoComments,
	saveDemoComment,
} from "@/lib/demo-comment-store";

export async function GET(request: Request) {
	const gameId = new URL(request.url).searchParams.get("gameId");
	if (!isGameId(gameId)) {
		return NextResponse.json({ comments: [] });
	}
	const comments = await listDemoComments(gameId);
	return NextResponse.json(
		{
			comments: comments.map(({ id, text, createdAt }) => ({ id, text, createdAt })),
		},
		{ headers: { "Cache-Control": "no-store" } },
	);
}

export async function POST(request: Request) {
	let body: { id?: unknown; gameId?: unknown; text?: unknown };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	if (!isCommentId(body.id) || !isGameId(body.gameId) || typeof body.text !== "string") {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	try {
		const saved = await saveDemoComment({
			id: body.id,
			gameId: body.gameId,
			text: body.text,
		});
		return NextResponse.json({
			ok: true,
			comment: { id: saved.id, text: saved.text, createdAt: saved.createdAt },
		});
	} catch (error) {
		const full = error instanceof Error && error.message === "full";
		return NextResponse.json({ ok: false }, { status: full ? 429 : 400 });
	}
}

export async function DELETE(request: Request) {
	let body: { id?: unknown; gameId?: unknown };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	if (!isCommentId(body.id) || !isGameId(body.gameId)) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	await deleteDemoComment({ id: body.id, gameId: body.gameId });
	return NextResponse.json({ ok: true });
}
