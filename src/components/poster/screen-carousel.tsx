"use client";

import { useEffect, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GameSlide } from "@/components/games/game-slide";
import { games } from "@/data/games";

type UseGameReelOptions = {
	paused: boolean;
	startIndex?: number;
	onActiveGameChange: (id: string) => void;
};

export function useGameReel({
	paused,
	startIndex = 0,
	onActiveGameChange,
}: UseGameReelOptions) {
	const [index, setIndex] = useState(startIndex);
	const [epoch, setEpoch] = useState(0);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const reduce = useReducedMotion();
	const activeGame = games[index];

	useEffect(() => {
		onActiveGameChange(activeGame.id);
	}, [activeGame.id, onActiveGameChange]);

	useEffect(() => {
		const autoplay = reduce === false && !paused && !hovered && !focused;
		if (!autoplay) {
			return;
		}

		let timer = 0;
		const start = () => {
			window.clearInterval(timer);
			if (document.hidden) {
				return;
			}
			timer = window.setInterval(() => {
				setIndex((current) => (current + 1) % games.length);
			}, 5000);
		};

		start();
		document.addEventListener("visibilitychange", start);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", start);
		};
	}, [epoch, focused, hovered, paused, reduce]);

	function go(step: number) {
		setEpoch((current) => current + 1);
		setIndex((current) => (current + step + games.length) % games.length);
	}

	function select(nextIndex: number) {
		setEpoch((current) => current + 1);
		setIndex(nextIndex);
	}

	function onPointerUp(event: PointerEvent<HTMLDivElement>) {
		const startX = Number(event.currentTarget.dataset.startX);
		const startY = Number(event.currentTarget.dataset.startY);
		if (!Number.isFinite(startX) || !Number.isFinite(startY)) {
			return;
		}
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		delete event.currentTarget.dataset.startX;
		delete event.currentTarget.dataset.startY;
		if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) {
			return;
		}
		go(dx < 0 ? 1 : -1);
	}

	return {
		activeGame,
		index,
		reduce,
		go,
		select,
		setHovered,
		setFocused,
		onPointerUp,
	};
}

type ScreenStageProps = {
	index: number;
	reduce: boolean | null;
	label: string;
	onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export function ScreenStage({
	index,
	reduce,
	label,
	onPointerUp,
}: ScreenStageProps) {
	return (
		<div
			className="relative h-full w-full touch-pan-y select-none"
			role="region"
			aria-roledescription="carrusel"
			aria-label={label}
			onPointerDown={(event) => {
				event.currentTarget.dataset.startX = String(event.clientX);
				event.currentTarget.dataset.startY = String(event.clientY);
			}}
			onPointerUp={onPointerUp}
			onPointerCancel={(event) => {
				delete event.currentTarget.dataset.startX;
				delete event.currentTarget.dataset.startY;
			}}
		>
			{games.map((game, gameIndex) => {
				const active = gameIndex === index;
				return (
					<motion.div
						key={game.id}
						className="absolute inset-0"
						initial={false}
						animate={{ opacity: active ? 1 : 0 }}
						transition={{ duration: reduce ? 0 : 0.6, ease: "easeInOut" }}
						aria-hidden={!active}
						inert={!active}
					>
						<GameSlide game={game} />
					</motion.div>
				);
			})}
		</div>
	);
}
