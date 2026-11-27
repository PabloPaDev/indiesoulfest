import { NextResponse } from "next/server";
import { assertCsrf } from "@/lib/playnotes/oauth/cookies";

export async function requireCsrf(
	request: Request,
): Promise<NextResponse | null> {
	const ok = await assertCsrf(request);
	if (ok) return null;
	return NextResponse.json(
		{ error: "CSRF inválido." },
		{ status: 403, headers: { "Cache-Control": "no-store" } },
	);
}

export function jsonNoStore(
	body: unknown,
	init?: { status?: number },
): NextResponse {
	return NextResponse.json(body, {
		status: init?.status ?? 200,
		headers: { "Cache-Control": "no-store" },
	});
}
