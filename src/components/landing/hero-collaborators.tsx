"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
	type CollaboratorLogo,
	internationalCollaborators,
} from "@/data/collaborators";
import styles from "./hero-collaborators.module.css";

type HeroCollaboratorsProps = {
	gamesCount: number;
};

function logoFrameStyle(logo: CollaboratorLogo): CSSProperties {
	return { aspectRatio: `${logo.crop.width} / ${logo.crop.height}` };
}

function logoImageStyle(logo: CollaboratorLogo): CSSProperties {
	return {
		position: "absolute",
		width: `${(logo.width / logo.crop.width) * 100}%`,
		height: "auto",
		maxWidth: "none",
		left: `${(-logo.crop.x / logo.crop.width) * 100}%`,
		top: `${(-logo.crop.y / logo.crop.height) * 100}%`,
	};
}

/** Franja de la portada: cupo, patrocinador y colaboradores con juegos desplegables. */
export function HeroCollaborators({ gamesCount }: HeroCollaboratorsProps) {
	const [openId, setOpenId] = useState<string | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const panelId = useId();

	useEffect(() => {
		if (!openId) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpenId(null);
		};
		const onPointer = (event: PointerEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (event.target instanceof Node && !root.contains(event.target)) {
				setOpenId(null);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onPointer);
		};
	}, [openId]);

	return (
		<div ref={rootRef} className={styles.strip}>
			<p className={styles.meta}>
				{gamesCount} JUEGOS <span className={styles.metaSlash}>/</span> SIN IA GENERATIVA
			</p>
			<div className={styles.rule} aria-hidden="true" />
			<div className={styles.columns}>
				<div className={styles.column}>
					<p className={styles.label}>PATROCINADOR</p>
					<p className={styles.value}>GAMES 4 PLAYERS</p>
				</div>
				<div className={styles.columnDivider} aria-hidden="true" />
				<div className={styles.column}>
					<p className={styles.label}>COLABORADORES</p>
					<div className={styles.collaborators}>
						{internationalCollaborators.map((collaborator) => {
							const open = openId === collaborator.id;
							return (
								<div key={collaborator.id} className={styles.collaborator}>
									<div
										className={styles.logoFrame}
										style={logoFrameStyle(collaborator.logo)}
										aria-label={collaborator.name}
										role="img"
									>
										<img
											src={collaborator.logo.src}
											alt=""
											width={collaborator.logo.width}
											height={collaborator.logo.height}
											className={styles.logo}
											style={logoImageStyle(collaborator.logo)}
										/>
									</div>
									<button
										type="button"
										className={`${styles.toggle}${open ? ` ${styles.toggleOpen}` : ""}`}
										aria-expanded={open}
										aria-controls={`${panelId}-${collaborator.id}`}
										onClick={() => setOpenId(open ? null : collaborator.id)}
									>
										SUS JUEGOS
										<span aria-hidden="true">{open ? "−" : "+"}</span>
									</button>
									{open ? (
										<div
											id={`${panelId}-${collaborator.id}`}
											className={styles.panel}
											role="region"
											aria-label={`Videojuegos de ${collaborator.name}`}
										>
											<p className={styles.panelNote}>
												Proyectos del colaborador.
											</p>
											<ul className={styles.games}>
												{collaborator.games.map((game) => {
													const portrait = game.portraitImage;
													return (
														<li key={game.id}>
															<a
																className={styles.game}
																href={game.storeUrl}
																target="_blank"
																rel="noopener noreferrer"
															>
																<img
																	className={portrait ? styles.portrait : styles.header}
																	src={portrait ?? game.image}
																	alt=""
																	width={portrait ? game.portraitWidth : game.imageWidth}
																	height={portrait ? game.portraitHeight : game.imageHeight}
																	loading="lazy"
																	decoding="async"
																/>
																<span className={styles.gameCopy}>
																	<span className={styles.gameTitle}>{game.title}</span>
																	<span className={styles.gameStore}>{game.storeName}</span>
																</span>
															</a>
														</li>
													);
												})}
											</ul>
											<a
												className={styles.profile}
												href={collaborator.profileUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												{collaborator.profileLabel}
											</a>
										</div>
									) : null}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
