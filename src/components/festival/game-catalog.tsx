"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { FestivalGameCard } from "@/components/festival/festival-game-card";
import {
	festivalCatalog,
	getPendingFestivalGames,
	getPublishedFestivalGames,
} from "@/data/festivalCatalog";
import { forPlayPretend } from "@/lib/display-text";
import type { FestivalGame } from "@/types/festival-game";
import styles from "./game-catalog.module.css";

type CatalogFilter = "all" | "demo" | "steam" | "itch";

const FILTERS: { id: CatalogFilter; label: string }[] = [
	{ id: "all", label: "Todos" },
	{ id: "demo", label: "Con demo" },
	{ id: "steam", label: "Steam" },
	{ id: "itch", label: "itch.io" },
];

function matchesFilter(game: FestivalGame, filter: CatalogFilter): boolean {
	if (filter === "all") return true;
	if (filter === "demo") return !!game.demoUrl;
	if (filter === "steam") return game.steamAppId != null;
	if (filter === "itch") {
		return (
			game.demoStore === "itch" ||
			!!game.storeUrl?.includes("itch.io")
		);
	}
	return true;
}

function SearchIcon() {
	return (
		<svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true">
			<circle
				cx="8.5"
				cy="8.5"
				r="5.25"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M12.5 12.5 17 17"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	);
}

type GameCatalogProps = {
	highlightId?: string;
	onSelectGame?: (id: string) => void;
};

export function GameCatalog({ highlightId, onSelectGame }: GameCatalogProps) {
	const published = getPublishedFestivalGames();
	const pending = getPendingFestivalGames();
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<CatalogFilter>("all");
	const [searchOpen, setSearchOpen] = useState(false);
	const deferredQuery = useDeferredValue(query.trim().toLowerCase());
	const searchInputId = useId();
	const searchRef = useRef<HTMLInputElement>(null);

	const filtered = useMemo(() => {
		return published.filter((game) => {
			if (!matchesFilter(game, filter)) return false;
			if (!deferredQuery) return true;
			const title = game.title?.toLowerCase() ?? "";
			const studio = game.studio?.toLowerCase() ?? "";
			return title.includes(deferredQuery) || studio.includes(deferredQuery);
		});
	}, [published, filter, deferredQuery]);

	useEffect(() => {
		if (!highlightId) return;
		const node = document.querySelector<HTMLElement>(
			`[data-catalog-game="${highlightId}"]`,
		);
		node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [highlightId]);

	useEffect(() => {
		if (!searchOpen) return;
		searchRef.current?.focus();
	}, [searchOpen]);

	return (
		<section id="catalogo" aria-labelledby="catalogo-titulo" className={styles.section}>
			<div className={styles.headingRow}>
				<h2
					id="catalogo-titulo"
					className={styles.heading}
					aria-label="Catálogo"
				>
					{forPlayPretend("Catálogo")}
				</h2>
				<button
					type="button"
					className={`${styles.searchToggle}${searchOpen || query || filter !== "all" ? ` ${styles.searchToggleActive}` : ""}`}
					aria-expanded={searchOpen}
					aria-controls={`${searchInputId}-panel`}
					aria-label={searchOpen ? "Ocultar búsqueda" : "Buscar en el catálogo"}
					onClick={() => setSearchOpen((open) => !open)}
				>
					<SearchIcon />
				</button>
			</div>

			<div
				id={`${searchInputId}-panel`}
				className={`${styles.toolbar}${searchOpen ? ` ${styles.toolbarOpen}` : ""}`}
			>
				<label className={`${styles.field} ${styles.searchField}`} htmlFor={searchInputId}>


					<span className={styles.label}>Buscar</span>
					<input
						id={searchInputId}
						ref={searchRef}
						className={styles.search}
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Título o estudio…"
						autoComplete="off"
					/>
				</label>
				<div className={styles.field}>
					<span className={styles.label}>Filtros</span>
					<div className={styles.filters} role="group" aria-label="Filtros del catálogo">
						{FILTERS.map((item) => (
							<button
								key={item.id}
								type="button"
								className={`${styles.filter}${filter === item.id ? ` ${styles.filterActive}` : ""}`}
								aria-pressed={filter === item.id}
								onClick={() => setFilter(item.id)}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<p className={styles.resultCount} aria-live="polite">
				Mostrando {filtered.length} de {published.length}
			</p>

			{filtered.length > 0 ? (
				<ul className={styles.grid}>
					{filtered.map((game) => (
						<li
							key={game.id}
							data-catalog-game={game.id}
							className={
								highlightId === game.id ? styles.gridItemHighlight : undefined
							}
							onFocusCapture={() => onSelectGame?.(game.id)}
						>
							<FestivalGameCard game={game} />
						</li>
					))}
				</ul>
			) : (
				<p className={styles.empty}>
					No hay fichas que coincidan con esa búsqueda o filtro.
				</p>
			)}

			{pending.length > 0 ? (
				<div className={styles.pending}>
					<h3 className={styles.pendingTitle}>
						{forPlayPretend("Pendientes de verificación")}
					</h3>
					<ul className={styles.pendingList}>
						{pending.map((game) => (
							<li key={game.id}>
								<span className={styles.pendingName}>
									{game.studio ?? "Estudio"} — {game.title ?? game.id}
								</span>
								{game.pendingReason ? (
									<span> — {game.pendingReason}</span>
								) : null}
							</li>
						))}
					</ul>
				</div>
			) : null}

			<p className={styles.resultCount} style={{ marginTop: "1.75rem" }}>
				Capacidad editorial: {festivalCatalog.length} entradas
			</p>
		</section>
	);
}
