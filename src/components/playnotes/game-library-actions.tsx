"use client";

import { useState, useTransition } from "react";
import {
	addToWishlist,
	getPlaynotesLoginUrl,
} from "@/lib/playnotes/festival-api";
import { useOptionalPlaynotesSession } from "@/components/playnotes/playnotes-session-context";

type GameLibraryActionsProps = {
	playnotesGameId?: string | null;
	igdbId?: number | null;
	demoUrl?: string | null;
	demoStore?: "steam" | "itch" | null;
};

export function GameLibraryActions({
	playnotesGameId,
	igdbId,
	demoUrl,
	demoStore,
}: GameLibraryActionsProps) {
	const ctx = useOptionalPlaynotesSession();
	const [message, setMessage] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	if (!ctx) return null;

	const { session, ready, libraryByGameId, libraryByIgdbId, patchStatus } = ctx;
	const linked = !!playnotesGameId || igdbId != null;
	const status =
		(playnotesGameId ? libraryByGameId[playnotesGameId] : undefined) ??
		(igdbId != null ? libraryByIgdbId[String(igdbId)] : undefined);

	const inLibrary = !!status?.inLibrary;
	const onWishlist = !!status?.wishlist;

	const onWishlistClick = () => {
		setMessage(null);
		if (!session.authenticated) {
			window.location.href = getPlaynotesLoginUrl("/festival");
			return;
		}
		if (!linked) {
			setMessage("Este juego aún no está vinculado a PlayNotes.");
			return;
		}
		startTransition(async () => {
			const result = await addToWishlist({
				gameId: playnotesGameId,
				igdbId,
			});
			if (result.loginRequired) {
				window.location.href = getPlaynotesLoginUrl("/festival");
				return;
			}
			setMessage(result.message);
			if (result.success && result.gameId) {
				patchStatus({
					gameId: result.gameId,
					igdbId: result.igdbId ?? igdbId ?? null,
					inLibrary: true,
					libraryStatus: result.status ?? "wishlist",
					wishlist: (result.status ?? "wishlist") === "wishlist",
				});
			}
		});
	};

	return (
		<div className="mt-3 flex flex-col gap-2">
			<div className="flex flex-wrap gap-2">
				{demoUrl ? (
					<a
						href={demoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex border-2 border-ink bg-ink px-2 py-1 font-gothic text-[0.68rem] tracking-[0.14em] text-cream uppercase"
					>
						{demoStore === "itch" ? "Demo en itch.io" : "Demo en Steam"}
					</a>
				) : null}

				{linked ? (
					<button
						type="button"
						onClick={onWishlistClick}
						disabled={pending || (ready && onWishlist) || (ready && inLibrary && !onWishlist)}
						className="inline-flex border-2 border-ink bg-cream px-2 py-1 font-gothic text-[0.68rem] tracking-[0.14em] uppercase disabled:opacity-50"
					>
						{!ready
							? "…"
							: !session.authenticated
								? "Entrar para deseados"
								: onWishlist
									? "En deseados"
									: inLibrary
										? "En tu biblioteca"
										: pending
											? "Guardando…"
											: "Añadir a deseados"}
					</button>
				) : null}
			</div>
			{ready && session.authenticated && inLibrary && status?.libraryStatus ? (
				<p className="font-gothic text-[0.65rem] tracking-[0.12em] uppercase opacity-70">
					Estado PlayNotes: {status.libraryStatus}
				</p>
			) : null}
			{message ? (
				<p className="font-gothic text-[0.65rem] tracking-[0.08em] uppercase opacity-80">
					{message}
				</p>
			) : null}
		</div>
	);
}
