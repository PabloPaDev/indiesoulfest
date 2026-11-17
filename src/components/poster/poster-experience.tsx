"use client";

import { useCallback, useRef } from "react";
import { motion } from "motion/react";
import { siteConfig } from "@/config/site";
import { games } from "@/data/games";
import { HandheldConsole } from "@/components/poster/handheld-console";
import { ENTER_DURATION, ENTER_EASE } from "@/components/transition/timing";
import { useFestivalTransition } from "@/components/transition/transition-provider";

const heroDescription =
	"Descubre y prueba videojuegos independientes seleccionados por nosotros.";

const mottoLines = siteConfig.motto.split(". ");

export function PosterExperience() {
	const posterRef = useRef<HTMLDivElement>(null);
	const screenRef = useRef<HTMLDivElement>(null);
	const gameIdRef = useRef(games[0].id);
	const { enter, phase, zoom } = useFestivalTransition();
	const busy = phase !== "idle";
	const activeZoom =
		zoom && !zoom.reduced && (phase === "zooming" || phase === "covered")
			? zoom
			: null;

	const onActiveGameChange = useCallback((id: string) => {
		gameIdRef.current = id;
	}, []);

	function onEnter() {
		const screen = screenRef.current;
		const poster = posterRef.current;
		if (!screen || !poster || busy) {
			return;
		}
		enter({
			screen: screen.getBoundingClientRect(),
			poster: poster.getBoundingClientRect(),
			gameId: gameIdRef.current,
		});
	}

	return (
		<motion.div
			ref={posterRef}
			className="isf-grid isf-cover min-h-dvh"
			initial={false}
			inert={busy}
			animate={
				activeZoom
					? { x: activeZoom.dx, y: activeZoom.dy, scale: activeZoom.scale }
					: { x: 0, y: 0, scale: 1 }
			}
			transition={
				activeZoom
					? { duration: ENTER_DURATION, ease: ENTER_EASE }
					: { duration: 0 }
			}
			style={{
				transformOrigin: activeZoom
					? `${activeZoom.originX}px ${activeZoom.originY}px`
					: "50% 50%",
			}}
		>
			<a className="skip-link" href="#portada">
				Saltar al contenido
			</a>
			<div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
				<header>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
						<p className="font-text text-sm leading-none tracking-[0.12em] uppercase sm:shrink-0">
							{siteConfig.organizers.replace(" y ", " / ")}
						</p>
						<span className="hidden h-px min-w-8 flex-1 bg-ink/80 sm:block" />
						<p className="font-text flex items-center gap-2 text-sm leading-none tracking-[0.12em] uppercase sm:shrink-0">
							<CalendarIcon />
							<span>
								{siteConfig.dates.label} de {siteConfig.editionYear}
							</span>
						</p>
					</div>
				</header>

				<main id="portada" className="flex flex-1 flex-col justify-center py-5 lg:py-2">
					<div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(15rem,19rem)_minmax(0,1fr)] lg:items-center lg:gap-x-6 lg:gap-y-1">
						<div className="flex items-start justify-between gap-4 lg:col-span-2">
							<h1 className="min-w-0 flex-1 font-display leading-[0.76] text-ink uppercase">
								<span className="block text-[clamp(3.6rem,16vw,5.8rem)] lg:hidden">
									Indie
									<br />
									Soul
									<br />
									Fest
								</span>
								<span className="hidden text-[clamp(4.8rem,7.5vw,7.7rem)] lg:block">
									<span className="block">Indie</span>
									<span className="block whitespace-nowrap">Soul Fest</span>
								</span>
							</h1>
							<SpeedLines />
						</div>

						<div className="contents lg:flex lg:flex-col lg:justify-center lg:gap-5">
							<div className="order-2 max-w-md lg:order-none lg:max-w-none">
								<p className="border-l-[3px] border-ink pl-3 font-text text-lg leading-snug font-semibold sm:text-xl">
									{mottoLines[0]}.
									<br />
									{mottoLines[1]}
								</p>
								<p className="mt-3 font-text text-base leading-relaxed">
									{heroDescription}
								</p>
							</div>
							<div className="order-3 lg:order-none">
								<EnterButton busy={busy} onEnter={onEnter} />
							</div>
						</div>

						<div className="order-1 lg:order-none lg:mt-3">
							<HandheldConsole
								screenRef={screenRef}
								paused
								onActiveGameChange={onActiveGameChange}
							/>
						</div>
					</div>
				</main>

				<footer className="pt-2">
					<div className="mb-3 h-px bg-ink" />
					<div className="flex flex-col gap-2 font-text text-sm leading-none tracking-[0.08em] uppercase sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<p>Demos de más de 25 estudios / Sin IA generativa</p>
						<p className="sm:border-l sm:border-ink sm:pl-6">
							Patrocinado por: {siteConfig.sponsor}
						</p>
					</div>
				</footer>
			</div>
		</motion.div>
	);
}

function SpeedLines() {
	return (
		<span
			className="mt-2 hidden shrink-0 items-center gap-1.5 lg:flex xl:mt-4 xl:gap-2"
			aria-hidden="true"
		>
			<span className="block h-9 w-2.5 -skew-x-[28deg] bg-ink xl:h-12 xl:w-3" />
			<span className="block h-9 w-2.5 -skew-x-[28deg] bg-ink xl:h-12 xl:w-3" />
			<span className="block h-9 w-2.5 -skew-x-[28deg] bg-ink xl:h-12 xl:w-3" />
			<span className="block h-9 w-2.5 -skew-x-[28deg] bg-ink xl:h-12 xl:w-3" />
		</span>
	);
}

function CalendarIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
			<rect
				x="3.5"
				y="5"
				width="17"
				height="15.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
			/>
			<path
				d="M3.5 10 H20.5 M8 3 V7 M16 3 V7"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
			/>
		</svg>
	);
}

function EnterButton({
	busy,
	onEnter,
}: {
	busy: boolean;
	onEnter: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onEnter}
			disabled={busy}
			aria-busy={busy}
			className="group inline-flex h-12 w-full items-center justify-center gap-3 border-2 border-ink bg-ink px-5 font-text text-base font-semibold tracking-[0.04em] text-cream uppercase transition-colors duration-150 hover:bg-cream hover:text-ink disabled:cursor-wait lg:w-auto lg:justify-start lg:px-6 motion-reduce:transition-none"
		>
			Entrar al festival
			<svg
				viewBox="0 0 20 12"
				className="h-3 w-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
				aria-hidden="true"
			>
				<path
					d="M0 6 H17 M12 1 L18 6 L12 11"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
				/>
			</svg>
		</button>
	);
}
