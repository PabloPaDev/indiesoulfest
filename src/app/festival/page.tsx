import type { Metadata } from "next";
import { FestivalHeader } from "@/components/layout/festival-header";
import { GameCatalog } from "@/components/festival/game-catalog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "El festival",
	description:
		"Explora Indie Soul Fest 2026 y descubre demos de videojuegos independientes. Prototipo del catálogo, del 1 al 31 de diciembre.",
	alternates: {
		canonical: "/festival",
	},
};

export default function FestivalPage() {
	return (
		<div className="isf-grid min-h-screen overflow-x-clip">
			<a className="skip-link" href="#festival">
				Saltar al contenido
			</a>
			<FestivalHeader />
			<main
				id="festival"
				className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
			>
				<p className="font-gothic text-xs tracking-[0.16em] uppercase sm:text-sm sm:tracking-[0.2em]">
					{siteConfig.dates.label} de {siteConfig.editionYear}
				</p>
				<h1 className="mt-3 max-w-full font-display text-[clamp(1.9rem,9vw,5.2rem)] leading-[0.82] uppercase">
					Explora el festival
				</h1>
				<p className="mt-5 max-w-2xl font-gothic text-base leading-relaxed sm:text-lg">
					Un mes para descubrir videojuegos independientes y probar sus demos.
					La primera edición apuesta por piezas artesanales, hechas sin IA
					generativa. {siteConfig.motto}
				</p>
				<p className="mt-6 max-w-2xl border-[3px] border-ink bg-white px-4 py-3 font-gothic text-sm leading-relaxed">
					Prototipo visual. Las fichas de esta página son datos de prueba,
					preparadas para sustituirse por los estudios confirmados.
				</p>
				<GameCatalog />
			</main>
			<footer className="border-t-4 border-ink px-4 py-6 text-center font-gothic text-[0.7rem] tracking-[0.16em] uppercase sm:text-xs">
				<p>Organizado por: {siteConfig.organizers}</p>
				<p className="mt-2">Patrocinado por: {siteConfig.sponsor}</p>
				<p className="mt-2">Diseñado por: {siteConfig.designer}</p>
			</footer>
		</div>
	);
}
