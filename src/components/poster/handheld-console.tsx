"use client";

import type { RefObject } from "react";
import { games } from "@/data/games";
import { GameSlide } from "@/components/games/game-slide";
import { screenSlotStyle } from "@/components/poster/console-geometry";
import { useGameReel } from "@/components/poster/screen-carousel";

const featuredGameId = "prueba-orbita-menor";

const coverGameIndex = Math.max(
	0,
	games.findIndex((game) => game.id === featuredGameId),
);

type HandheldConsoleProps = {
	screenRef: RefObject<HTMLDivElement | null>;
	paused: boolean;
	onActiveGameChange: (id: string) => void;
};

export function HandheldConsole({
	screenRef,
	paused,
	onActiveGameChange,
}: HandheldConsoleProps) {
	const reel = useGameReel({
		paused,
		startIndex: coverGameIndex,
		onActiveGameChange,
	});
	const { activeGame, index } = reel;

	return (
		<div className="relative min-w-0">
			<img
				src="/console/handheld.png"
				alt=""
				className="block h-auto w-full"
			/>
			<div
				ref={screenRef}
				className="absolute overflow-hidden bg-black"
				style={screenSlotStyle()}
				role="region"
				aria-roledescription="carrusel"
				aria-label="Juegos del festival"
				onMouseEnter={() => reel.setHovered(true)}
				onMouseLeave={() => reel.setHovered(false)}
				onFocus={() => reel.setFocused(true)}
				onBlur={() => reel.setFocused(false)}
				onPointerDown={(event) => {
					event.currentTarget.dataset.startX = String(event.clientX);
					event.currentTarget.dataset.startY = String(event.clientY);
				}}
				onPointerUp={reel.onPointerUp}
				onPointerCancel={(event) => {
					delete event.currentTarget.dataset.startX;
					delete event.currentTarget.dataset.startY;
				}}
			>
				<div className="absolute inset-0">
					{activeGame.id === featuredGameId ? (
						<img
							src="/console/cover-still.png"
							alt=""
							className="h-full w-full object-cover object-center"
						/>
					) : (
						<GameSlide game={activeGame} />
					)}
				</div>
				<button
					type="button"
					className="absolute top-[38%] left-[3%] flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white sm:h-8 sm:w-8"
					aria-label="Juego anterior"
					onClick={() => reel.go(-1)}
				>
					<Chevron direction="left" />
				</button>
				<button
					type="button"
					className="absolute top-[38%] right-[3%] flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white sm:h-8 sm:w-8"
					aria-label="Juego siguiente"
					onClick={() => reel.go(1)}
				>
					<Chevron direction="right" />
				</button>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-[4%] pt-[12%] pb-[4%]">
					<div className="flex items-end justify-between gap-3">
						<div className="min-w-0">
							<p className="font-text text-[clamp(0.78rem,1.6vw,1.3rem)] leading-tight font-bold tracking-wide text-white uppercase">
								{activeGame.title}
							</p>
							<p className="mt-[0.3em] font-text text-[clamp(0.65rem,1vw,0.9rem)] leading-tight text-white/90">
								{activeGame.studio}
							</p>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-2">
							{activeGame.demo ? (
								<span className="rounded-full bg-[#e23b32] px-2 py-0.5 font-text text-[clamp(0.55rem,0.8vw,0.7rem)] leading-none font-bold tracking-wide text-white uppercase">
									Demo
								</span>
							) : null}
							<div
								className="pointer-events-auto hidden gap-1 sm:flex"
								role="tablist"
								aria-label="Elegir juego"
							>
								{games.map((game, gameIndex) => (
									<button
										key={game.id}
										type="button"
										role="tab"
										aria-label={game.title}
										aria-selected={gameIndex === index}
										className={
											gameIndex === index
												? "h-1.5 w-1.5 bg-white"
												: "h-1.5 w-1.5 bg-white/40"
										}
										onClick={() => reel.select(gameIndex)}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function Chevron({ direction }: { direction: "left" | "right" }) {
	const points = direction === "left" ? "14 4 6 12 14 20" : "6 4 14 12 6 20";
	return (
		<svg viewBox="0 0 20 24" className="h-[55%] w-[55%]" aria-hidden="true">
			<polyline
				points={points}
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
