"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FestivalHeader } from "@/components/layout/festival-header";
import { FestivalExplorer } from "@/components/festival/festival-explorer";
import { GameCatalog } from "@/components/festival/game-catalog";
import { FestivalGameDialog } from "@/components/festival/festival-game-card";
import { FestivalListProvider } from "@/components/playnotes/festival-list/festival-list-context";
import { FestivalListWidget } from "@/components/playnotes/festival-list/festival-list-widget";
import { getPublishedFestivalGames } from "@/data/festivalCatalog";
import type { FestivalGame } from "@/types/festival-game";
import { forPlayPretend } from "@/lib/display-text";
import styles from "./festival-experience.module.css";

type FestivalView = "explorer" | "catalog";

function shuffleGames(games: FestivalGame[]): FestivalGame[] {
	const next = [...games];
	for (let index = next.length - 1; index > 0; index -= 1) {
		const swap = Math.floor(Math.random() * (index + 1));
		const current = next[index];
		next[index] = next[swap];
		next[swap] = current;
	}
	return next;
}

function CarouselIcon() {
	return (
		<svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
			<rect x="1" y="4" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<path d="M12 6h3v6h-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

function GridIcon() {
	return (
		<svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
			<rect x="1.5" y="1.5" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<rect x="9.5" y="1.5" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<rect x="1.5" y="9.5" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<rect x="9.5" y="9.5" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

export function FestivalExperience() {
	const published = useMemo(() => getPublishedFestivalGames(), []);
	const [games, setGames] = useState(published);
	const [view, setView] = useState<FestivalView>("explorer");
	const [selectedId, setSelectedId] = useState(published[0]?.id ?? "");

	useLayoutEffect(() => {
		const shuffled = shuffleGames(published);
		setGames(shuffled);
		setSelectedId(shuffled[0]?.id ?? "");
	}, [published]);
	const [detailId, setDetailId] = useState<string | null>(null);

	const detailGame =
		detailId != null
			? (games.find((game) => game.id === detailId) ?? null)
			: null;

	useEffect(() => {
		if (view !== "explorer") return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [view]);

	const intro = (
		<>
			<h1 className={styles.title} aria-label="Explora el festival">
				{forPlayPretend("Explora el festival")}
			</h1>
			<p className={styles.lead}>
				Un mes para descubrir videojuegos independientes y probar sus demos.
			</p>
		</>
	);

	const switcher = (
		<div
			className={`${styles.switcher}${view === "explorer" ? ` ${styles.switcherCorner}` : ""}`}
			role="tablist"
			aria-label="Modo de exploración"
		>
			<button
				type="button"
				role="tab"
				aria-label="Explorador"
				aria-selected={view === "explorer"}
				className={`${styles.switchBtn}${view === "explorer" ? ` ${styles.switchBtnActive}` : ""}`}
				onClick={() => setView("explorer")}
			>
				<CarouselIcon />
				<span className={styles.switchLabel}>Explorador</span>
			</button>
			<button
				type="button"
				role="tab"
				aria-label="Catálogo"
				aria-selected={view === "catalog"}
				className={`${styles.switchBtn}${view === "catalog" ? ` ${styles.switchBtnActive}` : ""}`}
				onClick={() => setView("catalog")}
			>
				<GridIcon />
				<span className={styles.switchLabel}>
					{forPlayPretend("Catálogo")}
				</span>
			</button>
		</div>
	);

	return (
		<FestivalListProvider games={games} onOpenGame={setDetailId}>
			<div
				className={`${styles.rootGrid}${view === "explorer" ? ` ${styles.rootExplorer}` : ""}`}
			>
				<a className="skip-link" href="#festival">
					Saltar al contenido
				</a>
				<FestivalHeader reserveList={view === "explorer"} />
				<main id="festival" className={view === "explorer" ? styles.mainExplorer : undefined}>
					{view === "explorer" ? (
						<FestivalExplorer
							games={games}
							selectedId={selectedId || games[0]?.id || ""}
							onSelect={setSelectedId}
							onDiscover={setDetailId}
							keyboardEnabled={detailGame == null}
							header={
								<div className={`${styles.top} ${styles.topOverlay}`}>
									{intro}
								</div>
							}
							toolbar={<div className={styles.topOverlay}>{switcher}</div>}
						/>
					) : (
						<>
							<div className={styles.shell}>
								<div className={styles.top}>
									{intro}
									{switcher}
								</div>
							</div>
							<div className={styles.catalogWrap}>
								<GameCatalog
									games={games}
									highlightId={selectedId}
									onSelectGame={setSelectedId}
									listAction={<FestivalListWidget placement="inline" />}
								/>
							</div>
						</>
					)}
				</main>

				{detailGame ? (
					<FestivalGameDialog
						game={detailGame}
						onClose={() => setDetailId(null)}
					/>
				) : null}

				{view === "explorer" ? <FestivalListWidget /> : null}
			</div>
		</FestivalListProvider>
	);
}
