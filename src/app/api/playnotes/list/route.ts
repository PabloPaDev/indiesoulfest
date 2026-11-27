import { fetchIsfList } from "@/lib/playnotes/oauth/playnotes-api";
import { jsonNoStore } from "@/lib/playnotes/oauth/csrf";

export async function GET() {
	const result = await fetchIsfList();
	if (!result.ok) {
		return jsonNoStore(
			{ error: result.error, authenticated: result.status !== 401 },
			{ status: result.status },
		);
	}
	return jsonNoStore(result.data);
}
