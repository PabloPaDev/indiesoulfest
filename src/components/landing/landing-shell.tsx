"use client";

import {
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import styles from "./landing-shell.module.css";

type LandingShellProps = {
	hero: ReactNode;
	behind: ReactNode;
	after: ReactNode;
	footer: ReactNode;
};

/** Capas con parada de scroll: hero → detrás del festival → PlayNotes → footer fijo. */
export function LandingShell({ hero, behind, after, footer }: LandingShellProps) {
	const afterRef = useRef<HTMLDivElement>(null);
	const coverRef = useRef<HTMLElement>(null);
	const [heroProgress, setHeroProgress] = useState(0);
	const [behindProgress, setBehindProgress] = useState(0);

	useEffect(() => {
		document.documentElement.classList.add("isf-hero-snap");
		return () => document.documentElement.classList.remove("isf-hero-snap");
	}, []);

	useEffect(() => {
		const afterEl = afterRef.current;
		const coverEl = coverRef.current;
		if (!afterEl || !coverEl) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		let frame = 0;
		const update = () => {
			frame = 0;
			const vh = window.innerHeight || 1;
			const afterTop = afterEl.getBoundingClientRect().top;
			const coverTop = coverEl.getBoundingClientRect().top;
			const nextHero = 1 - Math.min(1, Math.max(0, afterTop / vh));
			const nextBehind = 1 - Math.min(1, Math.max(0, coverTop / vh));
			setHeroProgress((prev) => (Math.abs(prev - nextHero) < 0.008 ? prev : nextHero));
			setBehindProgress((prev) => (Math.abs(prev - nextBehind) < 0.008 ? prev : nextBehind));
		};

		const onScroll = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(update);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div className={styles.shell}>
			<div
				className={`isf-hero-pin ${styles.heroPin}`}
				style={{
					opacity: 1 - heroProgress * 0.92,
					transform: `scale(${1 - heroProgress * 0.04})`,
				}}
			>
				{hero}
			</div>

			<div ref={afterRef} id="landing-after" className={`isf-landing-after ${styles.after}`}>
				<div
					className={`isf-section-pin ${styles.sectionPin}`}
					style={{
						opacity: 1 - behindProgress * 0.9,
						transform: `scale(${1 - behindProgress * 0.035})`,
					}}
				>
					{behind}
				</div>

				<section
					ref={coverRef}
					className={`isf-section-cover ${styles.sectionCover}`}
					aria-label="Integración con PlayNotes"
				>
					{after}
				</section>
			</div>

			<div className={styles.footerSlot}>{footer}</div>
		</div>
	);
}
