"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
	type TouchEvent as ReactTouchEvent,
} from "react";
import type { FestivalGame } from "@/types/festival-game";
import {
	getFestivalBackdropUrl,
	getFestivalCoverUrl,
	getFestivalPortraitUrl,
} from "@/lib/festival-media";
import { AddToFestivalListButton } from "@/components/playnotes/festival-list/add-to-festival-list-button";
import styles from "./festival-explorer.module.css";

type FestivalExplorerProps = {
	games: FestivalGame[];
	selectedId: string;
	onSelect: (id: string) => void;
	onDiscover: (id: string) => void;
	/** Cabecera de la página, pintada sobre el fondo. */
	header?: ReactNode;
	/** Controles de la esquina superior, en el hueco del contador. */
	toolbar?: ReactNode;
	/** Flechas del teclado solo mientras el explorador es la vista activa. */
	keyboardEnabled?: boolean;
};

const PRELOAD_RADIUS = 2;

function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	return Boolean(target.closest("[role='dialog'], [contenteditable='true']"));
}

export function FestivalExplorer({
	games,
	selectedId,
	onSelect,
	onDiscover,
	header,
	toolbar,
	keyboardEnabled = true,
}: FestivalExplorerProps) {
	const index = Math.max(
		0,
		games.findIndex((game) => game.id === selectedId),
	);
	const active = games[index] ?? games[0];
	const trackRef = useRef<HTMLDivElement>(null);
	const showARef = useRef(true);
	const bgARef = useRef<string | null>(null);
	const bgBRef = useRef<string | null>(null);
	const [reduceMotion, setReduceMotion] = useState(false);
	const [bgA, setBgA] = useState<string | null>(() =>
		games[0] ? getFestivalBackdropUrl(games[0]) : null,
	);
	const [bgB, setBgB] = useState<string | null>(null);
	const [showA, setShowA] = useState(true);
	const touchStartX = useRef<number | null>(null);

	bgARef.current = bgA;
	bgBRef.current = bgB;
	showARef.current = showA;

	const nearbyIds = useMemo(() => {
		const ids = new Set<string>();
		for (let i = index - PRELOAD_RADIUS; i <= index + PRELOAD_RADIUS; i++) {
			const game = games[(i + games.length) % games.length];
			if (game) ids.add(game.id);
		}
		return ids;
	}, [games, index]);

	useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setReduceMotion(media.matches);
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		if (!active) return;
		const next = getFestivalBackdropUrl(active);
		if (!next) return;
		const current = showARef.current ? bgARef.current : bgBRef.current;
		if (current === next) return;

		let cancelled = false;
		const apply = () => {
			if (cancelled) return;
			if (showARef.current) {
				setBgB(next);
				requestAnimationFrame(() => {
					if (!cancelled) setShowA(false);
				});
				return;
			}
			setBgA(next);
			requestAnimationFrame(() => {
				if (!cancelled) setShowA(true);
			});
		};

		const img = new Image();
		img.decoding = "async";
		img.onload = apply;
		img.onerror = apply;
		img.src = next;
		if (img.complete) apply();

		return () => {
			cancelled = true;
		};
	}, [active?.id]);

	useEffect(() => {
		const urls = new Set<string>();
		for (const game of games) {
			if (!nearbyIds.has(game.id)) continue;
			for (const url of [
				getFestivalBackdropUrl(game),
				getFestivalCoverUrl(game),
				getFestivalPortraitUrl(game),
			]) {
				if (url) urls.add(url);
			}
		}
		for (const url of urls) {
			const img = new Image();
			img.decoding = "async";
			img.src = url;
		}
	}, [games, nearbyIds]);

	// Como en Steam OS: el seleccionado queda al inicio de la fila, con la misma sangría.
	useEffect(() => {
		const align = (behavior: ScrollBehavior) => {
			const track = trackRef.current;
			const selected = track?.querySelector<HTMLElement>(
				`[data-game-id="${selectedId}"]`,
			);
			if (!track || !selected) return;
			const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
			const trackLeft = track.getBoundingClientRect().left;
			const selectedLeft = selected.getBoundingClientRect().left;
			const delta = selectedLeft - trackLeft - padding;
			if (Math.abs(delta) < 1) return;
			track.scrollBy({ left: delta, behavior });
		};
		align(reduceMotion ? "auto" : "smooth");
		const onResize = () => align("auto");
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [selectedId, reduceMotion]);

	const go = useCallback(
		(delta: number) => {
			if (games.length === 0) return;
			const next = (index + delta + games.length) % games.length;
			onSelect(games[next].id);
		},
		[games, index, onSelect],
	);

	useEffect(() => {
		if (!keyboardEnabled) return;
		const onKey = (event: KeyboardEvent) => {
			if (isTypingTarget(event.target)) return;
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				go(-1);
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				go(1);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [go, keyboardEnabled]);

	const onSwipeStart = (event: ReactTouchEvent) => {
		if ((event.target as HTMLElement | null)?.closest(`.${styles.track}`)) {
			touchStartX.current = null;
			return;
		}
		touchStartX.current = event.changedTouches[0]?.clientX ?? null;
	};

	const onSwipeEnd = (event: ReactTouchEvent) => {
		const start = touchStartX.current;
		touchStartX.current = null;
		if (start == null) return;
		const end = event.changedTouches[0]?.clientX;
		if (end == null) return;
		const delta = end - start;
		if (Math.abs(delta) < 56) return;
		go(delta < 0 ? 1 : -1);
	};

	if (!active) return null;

	const title = active.title ?? "Sin título";
	const studio = active.studio ?? "Estudio por confirmar";

	const renderBackdropLayers = (imageClass: string) =>
		[
			{ src: bgA, visible: showA },
			{ src: bgB, visible: !showA },
		].map((layer, i) =>
			layer.src ? (
				<img
					key={i}
					className={`${styles.backdropLayer} ${imageClass}${layer.visible ? ` ${styles.backdropLayerVisible}` : ""}`}
					src={layer.src}
					alt=""
					decoding="async"
				/>
			) : null,
		);

	return (
		<section
			className={`${styles.explorer}${reduceMotion ? ` ${styles.reduceMotion}` : ""}`}
			aria-label="Explorador del festival"
			onTouchStart={onSwipeStart}
			onTouchEnd={onSwipeEnd}
		>
			<div className={styles.backdrop} aria-hidden>
				{renderBackdropLayers(styles.backdropFill)}
				<div className={styles.veil} />
			</div>
			<div className={styles.heroArea} aria-hidden>
				{renderBackdropLayers(styles.backdropHero)}
				<div className={styles.veil} />
			</div>

			<div className={styles.topBar}>
				<div className={styles.header}>{header}</div>
				{toolbar ? <div className={styles.nav}>{toolbar}</div> : null}
			</div>

			<div className={styles.shelf}>
				<div ref={trackRef} className={styles.track}>
					{games.map((game) => {
						const selected = game.id === active.id;
						const near = nearbyIds.has(game.id);
						const portrait = getFestivalPortraitUrl(game);
						const src = selected
							? getFestivalCoverUrl(game)
							: (portrait ?? getFestivalCoverUrl(game));
						return (
							<button
								key={game.id}
								type="button"
								data-game-id={game.id}
								className={`${styles.card}${selected ? ` ${styles.cardActive}` : ""}${!selected && !portrait ? ` ${styles.cardNoPortrait}` : ""}`}
								aria-pressed={selected}
								aria-label={game.title ?? game.id}
								onClick={() =>
									selected ? onDiscover(game.id) : onSelect(game.id)
								}
							>
								{src ? (
									<img
										src={src}
										alt=""
										loading={near ? "eager" : "lazy"}
										decoding="async"
										draggable={false}
									/>
								) : null}
							</button>
						);
					})}
				</div>
			</div>

			<div className={styles.info} key={active.id}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.studio}>{studio}</p>
				<p className={styles.blurb}>
					{active.shortDescription ?? "\u00a0"}
				</p>
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.primary}
						onClick={() => onDiscover(active.id)}
					>
								Descubrir
							</button>
							{active.demoUrl ? (
								<a
									className={styles.ghost}
									href={active.demoUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									Jugar
								</a>
					) : null}
					<AddToFestivalListButton
						gameId={active.id}
						tone="onDark"
						className={styles.addListDesktop}
					/>
				</div>
			</div>
		</section>
	);
}
