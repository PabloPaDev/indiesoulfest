"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GameSlide } from "@/components/games/game-slide";
import { ENTER_DURATION, ENTER_EASE } from "@/components/transition/timing";
import { getGameById } from "@/data/games";

type Phase = "idle" | "zooming" | "covered";

type Box = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type ZoomMotion = {
	dx: number;
	dy: number;
	scale: number;
	originX: number;
	originY: number;
	rect: Box;
	reduced: boolean;
};

type EnterArgs = {
	screen: Box;
	poster: Box;
	gameId: string;
};

type TransitionContextValue = {
	phase: Phase;
	zoom: ZoomMotion | null;
	enter: (args: EnterArgs) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useFestivalTransition() {
	const value = useContext(TransitionContext);
	if (!value) {
		throw new Error("La transición debe usarse dentro de TransitionProvider.");
	}
	return value;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [phase, setPhase] = useState<Phase>("idle");
	const [zoom, setZoom] = useState<ZoomMotion | null>(null);
	const [gameId, setGameId] = useState<string | null>(null);
	const phaseRef = useRef<Phase>("idle");
	const lockRef = useRef(false);
	const [trackedPath, setTrackedPath] = useState(pathname);
	const revealing = phase === "covered" && pathname === "/festival";

	if (pathname !== trackedPath) {
		setTrackedPath(pathname);
		if (pathname === "/" && phase === "covered") {
			setPhase("idle");
			setZoom(null);
			setGameId(null);
		}
	}

	useEffect(() => {
		phaseRef.current = phase;
		if (phase === "idle") {
			lockRef.current = false;
		}
	}, [phase]);

	useEffect(() => {
		router.prefetch("/festival");
	}, [router]);

	useEffect(() => {
		if (phase === "idle") {
			return;
		}
		const previousOverflow = document.body.style.overflow;
		const previousPad = document.body.style.paddingRight;
		const gap = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";
		if (gap > 0) {
			document.body.style.paddingRight = `${gap}px`;
		}
		return () => {
			document.body.style.overflow = previousOverflow;
			document.body.style.paddingRight = previousPad;
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "zooming") {
			return;
		}
		const timeout = window.setTimeout(() => {
			if (phaseRef.current !== "zooming") {
				return;
			}
			phaseRef.current = "covered";
			setPhase("covered");
			router.push("/festival");
		}, zoom?.reduced ? 800 : 1800);
		return () => window.clearTimeout(timeout);
	}, [phase, router, zoom?.reduced]);

	const finishZoom = useCallback(() => {
		if (phaseRef.current !== "zooming") {
			return;
		}
		phaseRef.current = "covered";
		setPhase("covered");
		router.push("/festival");
	}, [router]);

	const finishReveal = useCallback(() => {
		if (phaseRef.current !== "covered") {
			return;
		}
		phaseRef.current = "idle";
		lockRef.current = false;
		setPhase("idle");
		setZoom(null);
		setGameId(null);
	}, []);

	useEffect(() => {
		if (!revealing) {
			return;
		}
		const timeout = window.setTimeout(
			() => {
				finishReveal();
			},
			zoom?.reduced ? 360 : 460,
		);
		return () => window.clearTimeout(timeout);
	}, [finishReveal, revealing, zoom?.reduced]);

	const enter = useCallback((args: EnterArgs) => {
		if (lockRef.current) {
			return;
		}
		if (args.screen.width < 2 || args.screen.height < 2) {
			return;
		}
		lockRef.current = true;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const screenCenterX = args.screen.left + args.screen.width / 2;
		const screenCenterY = args.screen.top + args.screen.height / 2;
		const scale =
			Math.max(
				window.innerWidth / args.screen.width,
				window.innerHeight / args.screen.height,
			) * 1.04;
		const nextZoom: ZoomMotion = {
			dx: window.innerWidth / 2 - screenCenterX,
			dy: window.innerHeight / 2 - screenCenterY,
			scale,
			originX: screenCenterX - args.poster.left,
			originY: screenCenterY - args.poster.top,
			rect: {
				left: args.screen.left,
				top: args.screen.top,
				width: args.screen.width,
				height: args.screen.height,
			},
			reduced,
		};
		phaseRef.current = "zooming";
		setGameId(args.gameId);
		setZoom(nextZoom);
		setPhase("zooming");
	}, []);

	const activeGame = getGameById(gameId ?? "");

	return (
		<TransitionContext.Provider value={{ phase, zoom, enter }}>
			{children}
			<p className="sr-only" aria-live="polite">
				{phase === "zooming" || phase === "covered"
					? "Entrando al festival"
					: ""}
			</p>
			{phase !== "idle" && !revealing ? (
				<div className="fixed inset-0 z-40" aria-hidden="true" />
			) : null}
			{zoom && phase !== "idle" ? (
				<motion.div
					className="fixed z-50 overflow-hidden bg-black"
					aria-hidden="true"
					initial={
						zoom.reduced
							? { opacity: 0 }
							: { x: 0, y: 0, scale: 1, opacity: 1, borderRadius: 6 }
					}
					animate={
						zoom.reduced
							? { opacity: revealing ? 0 : 1 }
							: {
									x: zoom.dx,
									y: zoom.dy,
									scale: zoom.scale,
									opacity: revealing ? 0 : 1,
									borderRadius: 0,
								}
					}
					transition={
						zoom.reduced
							? { duration: 0.22, ease: "easeOut" }
							: revealing
								? { duration: 0.28, ease: "easeInOut" }
								: { duration: ENTER_DURATION, ease: ENTER_EASE }
					}
					onAnimationComplete={(definition) => {
						const opacity =
							typeof definition === "object" &&
							definition !== null &&
							"opacity" in definition
								? definition.opacity
								: undefined;
						if (opacity === 0) {
							finishReveal();
							return;
						}
						if (phaseRef.current === "zooming") {
							finishZoom();
						}
					}}
					style={
						zoom.reduced
							? {
									top: 0,
									left: 0,
									width: "100vw",
									height: "100dvh",
									pointerEvents: revealing ? "none" : "auto",
								}
							: {
									top: zoom.rect.top,
									left: zoom.rect.left,
									width: zoom.rect.width,
									height: zoom.rect.height,
									transformOrigin: "center center",
									pointerEvents: revealing ? "none" : "auto",
								}
					}
				>
					<GameSlide game={activeGame} />
				</motion.div>
			) : null}
		</TransitionContext.Provider>
	);
}
