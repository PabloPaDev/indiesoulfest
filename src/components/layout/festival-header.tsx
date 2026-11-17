import Link from "next/link";
import { siteConfig } from "@/config/site";

export function FestivalHeader() {
	return (
		<header className="sticky top-0 z-30 border-b-4 border-ink bg-cream">
			<div className="mx-auto flex w-full min-w-0 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
				<Link href="/" className="flex min-w-0 max-w-full flex-col">
					<span className="font-display text-[clamp(1.15rem,6vw,2rem)] leading-[0.85] uppercase">
						Indie Soul Fest
					</span>
					<span className="font-gothic text-[0.68rem] tracking-[0.18em]">
						{siteConfig.editionYear}
					</span>
				</Link>
				<nav
					aria-label="Secciones del festival"
					className="flex flex-wrap items-center gap-x-4 gap-y-2 font-gothic text-xs tracking-[0.14em] uppercase sm:text-sm"
				>
					<Link
						href="/"
						className="underline decoration-transparent underline-offset-4 hover:decoration-ink"
					>
						Portada
					</Link>
					<a
						href="#catalogo"
						className="underline decoration-transparent underline-offset-4 hover:decoration-ink"
					>
						Catálogo
					</a>
					<a
						href={siteConfig.playnotesUrl}
						target="_blank"
						rel="noreferrer"
						className="underline decoration-transparent underline-offset-4 hover:decoration-ink"
					>
						PlayNotes
					</a>
				</nav>
			</div>
		</header>
	);
}
