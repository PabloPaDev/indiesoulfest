"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FestivalGame } from "@/types/festival-game";
import {
	getYoutubeEmbedUrl,
	getYoutubeVideoId,
} from "@/lib/festival-media";
import { AddToFestivalListButton } from "@/components/playnotes/festival-list/add-to-festival-list-button";
import styles from "./festival-game-card.module.css";

type FestivalGameCardProps = {
	game: FestivalGame;
};

export function FestivalGameCard({ game }: FestivalGameCardProps) {
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [canExpand, setCanExpand] = useState(false);
	const [expandLeft, setExpandLeft] = useState(false);
	const blurbRef = useRef<HTMLParagraphElement>(null);
	const slotRef = useRef<HTMLDivElement>(null);
	const title = game.title ?? "Sin título";
	const studio = game.studio ?? "Estudio por confirmar";

	useEffect(() => {
		setExpanded(false);
	}, [game.id, game.shortDescription]);

	useEffect(() => {
		const node = blurbRef.current;
		if (!node || expanded) return;
		const check = () => {
			setCanExpand(node.scrollHeight > node.clientHeight + 1);
		};
		check();
		const observer = new ResizeObserver(check);
		observer.observe(node);
		return () => observer.disconnect();
	}, [game.shortDescription, expanded]);

	useEffect(() => {
		if (!expanded) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setExpanded(false);
		};
		const onPointer = (event: PointerEvent) => {
			const slot = slotRef.current;
			if (!slot) return;
			if (event.target instanceof Node && !slot.contains(event.target)) {
				setExpanded(false);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onPointer);
		};
	}, [expanded]);

	const toggleExpand = () => {
		if (expanded) {
			setExpanded(false);
			return;
		}
		const slot = slotRef.current;
		if (slot) {
			const rect = slot.getBoundingClientRect();
			setExpandLeft(rect.left > window.innerWidth * 0.42);
		}
		setExpanded(true);
	};

	return (
		<>
			<div
				ref={slotRef}
				className={`${styles.cardSlot}${expanded ? ` ${styles.cardSlotExpanded}` : ""}`}
			>
				<article
					className={[
						styles.card,
						expanded ? styles.cardExpanded : styles.cardCollapsed,
						expanded
							? expandLeft
								? styles.cardExpandLeft
								: styles.cardExpandRight
							: "",
					]
						.filter(Boolean)
						.join(" ")}
				>
					<button
						type="button"
						className={styles.media}
						onClick={() => setOpen(true)}
						aria-label={`Descubrir ${title}`}
					>
						{game.coverImage ? (
							<img
								className={styles.cover}
								src={game.coverImage}
								alt=""
								loading="lazy"
								decoding="async"
								width={460}
								height={215}
							/>
						) : (
							<div className={styles.cover} aria-hidden />
						)}
					</button>
					<div className={styles.body}>
						<h3 className={styles.title}>{title}</h3>
						<p className={styles.studio}>{studio}</p>
						{game.shortDescription ? (
							<div className={styles.blurbBlock}>
								<p
									ref={blurbRef}
									className={`${styles.blurb}${expanded ? ` ${styles.blurbExpanded}` : ""}${canExpand && !expanded ? ` ${styles.blurbClamped}` : ""}`}
								>
									{game.shortDescription}
								</p>
							</div>
						) : (
							<div className={styles.blurbBlock} aria-hidden>
								<p className={styles.blurb}>&nbsp;</p>
							</div>
						)}
						<div className={styles.cardActions}>
							{canExpand || expanded || game.shortDescription ? (
								<button
									type="button"
									className={`${styles.expandBtn}${expanded ? ` ${styles.expandBtnOpen}` : ""}`}
									aria-expanded={expanded}
									aria-label={
										expanded ? "Cerrar descripción" : "Leer más"
									}
									onClick={toggleExpand}
								>
									{expanded ? "−" : "+"}
								</button>
							) : (
								<span className={styles.expandBtnSpacer} aria-hidden />
							)}
							<button
								type="button"
								className={styles.actionPrimary}
								onClick={() => setOpen(true)}
							>
								Descubrir
							</button>
							<div className={styles.listAction}>
								<AddToFestivalListButton gameId={game.id} compact />
							</div>
						</div>
					</div>
				</article>
			</div>

			{open ? (
				<FestivalGameDialog game={game} onClose={() => setOpen(false)} />
			) : null}
		</>
	);
}

type GallerySlide =
	| { kind: "trailer"; src: string; poster: string | null }
	| { kind: "shot"; src: string; index: number };

function buildGallerySlides(game: FestivalGame): GallerySlide[] {
	const slides: GallerySlide[] = [];
	const poster = game.trailerPoster ?? game.coverImage;
	if (game.trailerUrl || poster) {
		slides.push({
			kind: "trailer",
			src: game.trailerUrl ?? "",
			poster,
		});
	}
	game.screenshots.forEach((src, index) => {
		slides.push({ kind: "shot", src, index });
	});
	return slides;
}

function storeLinkLabel(game: FestivalGame): string {
	if (game.storeUrl?.includes("itch.io") || game.demoStore === "itch") {
		return "Ver en itch.io";
	}
	if (game.steamAppId || game.storeUrl?.includes("steampowered")) {
		return "Ver en Steam";
	}
	return "Ver ficha";
}

export function FestivalGameDialog({
	game,
	onClose,
}: {
	game: FestivalGame;
	onClose: () => void;
}) {
	const titleId = useId();
	const closeRef = useRef<HTMLButtonElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [playing, setPlaying] = useState(false);
	const [hlsUnsupported, setHlsUnsupported] = useState(false);
	const [slideIndex, setSlideIndex] = useState(0);
	const title = game.title ?? "Sin título";
	const studio = game.studio ?? null;
	const slides = useMemo(() => buildGallerySlides(game), [game]);
	const active = slides[slideIndex] ?? null;
	const hasMany = slides.length > 1;
	const storeHref = game.storeUrl ?? game.demoUrl;
	const youtubeId =
		active?.kind === "trailer"
			? getYoutubeVideoId(active.src || game.trailerUrl)
			: null;
	const youtubeEmbed = youtubeId ? getYoutubeEmbedUrl(youtubeId) : null;

	const slidesRef = useRef(slides);
	const slideIndexRef = useRef(slideIndex);
	slidesRef.current = slides;
	slideIndexRef.current = slideIndex;

	const goTo = (next: number) => {
		const list = slidesRef.current;
		if (list.length === 0) return;
		const clamped = (next + list.length) % list.length;
		setSlideIndex(clamped);
		if (list[clamped]?.kind !== "trailer") {
			const video = videoRef.current;
			if (video && !video.paused) video.pause();
			setPlaying(false);
		}
	};

	useEffect(() => {
		closeRef.current?.focus();
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
				return;
			}
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				goTo(slideIndexRef.current - 1);
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				goTo(slideIndexRef.current + 1);
			}
		};
		document.addEventListener("keydown", onKey);
		const scrollbar = window.innerWidth - document.documentElement.clientWidth;
		const prevOverflow = document.body.style.overflow;
		const prevPadding = document.body.style.paddingRight;
		document.body.style.overflow = "hidden";
		if (scrollbar > 0) {
			document.body.style.paddingRight = `${scrollbar}px`;
		}
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
			document.body.style.paddingRight = prevPadding;
		};
	}, [onClose]);

	const startTrailer = () => {
		if (!game.trailerUrl || playing) return;
		if (youtubeId) {
			setPlaying(true);
			return;
		}
		const video = videoRef.current;
		if (!video) return;
		const canHls =
			video.canPlayType("application/vnd.apple.mpegurl") !== "" ||
			video.canPlayType("application/x-mpegURL") !== "";
		if (!canHls && game.trailerUrl.includes(".m3u8")) {
			setHlsUnsupported(true);
			return;
		}
		setPlaying(true);
		if (video.src !== game.trailerUrl) {
			video.src = game.trailerUrl;
		}
		void video.play().catch(() => {
			setHlsUnsupported(true);
			setPlaying(false);
		});
	};

	return (
		<div
			className={styles.dialogBackdrop}
			role="presentation"
			onClick={onClose}
		>
			<div
				className={styles.dialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(event) => event.stopPropagation()}
			>
				<button
					ref={closeRef}
					type="button"
					className={styles.closeBtn}
					onClick={onClose}
					aria-label="Cerrar ficha"
				>
					×
				</button>

				<div className={styles.dialogBody}>
					{active ? (
						<div className={styles.gallery}>
							<div
								className={`${styles.trailerShell}${active.kind === "shot" ? ` ${styles.trailerShellShot}` : ""}`}
							>
								{active.kind === "trailer" ? (
									<>
										{youtubeEmbed && playing ? (
											<iframe
												className={styles.trailerYoutube}
												src={youtubeEmbed}
												title={`Tráiler de ${title}`}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
											/>
										) : (
											<>
												{game.trailerUrl && !youtubeId ? (
													<video
														ref={videoRef}
														className={styles.trailerVideo}
														controls={playing}
														playsInline
														preload="none"
														poster={active.poster ?? undefined}
													/>
												) : null}
												{active.poster ? (
													<img
														className={`${styles.trailerPoster}${playing ? ` ${styles.trailerPosterHidden}` : ""}`}
														src={active.poster}
														alt=""
														decoding="async"
													/>
												) : null}
												{game.trailerUrl && !playing ? (
													<button
														type="button"
														className={styles.playTrailer}
														onClick={startTrailer}
														aria-label="Reproducir tráiler"
													>
														<span className={styles.playIcon} aria-hidden>
															▶
														</span>
													</button>
												) : null}
											</>
										)}
									</>
								) : (
									<img
										className={styles.galleryShot}
										src={active.src}
										alt={`Captura ${active.index + 1} de ${title}`}
										decoding="async"
									/>
								)}

							</div>

							{hasMany ? (
								<div className={styles.galleryControls}>
									<button
										type="button"
										className={styles.galleryNav}
										aria-label="Anterior"
										onClick={() => goTo(slideIndex - 1)}
									>
										‹
									</button>
									<p className={styles.galleryCounter} aria-live="polite">
										{slideIndex + 1} / {slides.length}
									</p>
									<button
										type="button"
										className={styles.galleryNav}
										aria-label="Siguiente"
										onClick={() => goTo(slideIndex + 1)}
									>
										›
									</button>
								</div>
							) : null}
						</div>
					) : null}

					<div className={styles.dialogSide}>
						<h2 id={titleId} className={styles.dialogTitle}>
							{title}
						</h2>
						{studio ? <p className={styles.dialogStudio}>{studio}</p> : null}
						{game.shortDescription ? (
							<p className={styles.dialogCopy}>{game.shortDescription}</p>
						) : null}
						{hlsUnsupported && storeHref ? (
							<p className={styles.trailerFallback}>
								No se puede reproducir el tráiler aquí.{" "}
								<a
									href={storeHref}
									target="_blank"
									rel="noopener noreferrer"
								>
									Abrir ficha
								</a>
								.
							</p>
						) : null}

						<div className={styles.dialogActions}>
							{storeHref ? (
								<a
									className={styles.actionPrimary}
									href={storeHref}
									target="_blank"
									rel="noopener noreferrer"
								>
									{storeLinkLabel(game)}
								</a>
							) : null}
							<AddToFestivalListButton
								gameId={game.id}
								className={styles.dialogListBtn}
								label="Añadir lista en playnotes.es"
								activeLabel="✓ En playnotes.es"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
