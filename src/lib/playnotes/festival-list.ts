import { siteConfig } from "@/config/site";

/** Nombre visible de la lista en PlayNotes. */
export const FESTIVAL_LIST_NAME = "Indie Soul Fest 2026";

export {
	GUEST_FESTIVAL_LIST_STORAGE_KEY as FESTIVAL_LIST_STORAGE_KEY,
	readFestivalListLocal,
	writeFestivalListLocal,
	type FestivalListSnapshot,
} from "@/lib/playnotes/festival-list-storage";

export type SyncStatus = "guest" | "synced" | "pending" | "offline";

export function syncStatusLabel(status: SyncStatus): string {
	switch (status) {
		case "synced":
			return "Sincronizada con PlayNotes";
		case "pending":
			return "Pendiente de sincronizar";
		case "offline":
			return "Pendiente de sincronizar";
		case "guest":
		default:
			return "Guardada en este dispositivo";
	}
}

export function getPlaynotesProfileUrl(username: string | null): string {
	if (username) {
		return `${siteConfig.playnotesUrl}/u/${encodeURIComponent(username)}`;
	}
	return siteConfig.playnotesUrl;
}
