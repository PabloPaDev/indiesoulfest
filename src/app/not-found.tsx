import Link from "next/link";

export default function NotFound() {
	return (
		<div className="isf-grid flex min-h-screen items-center justify-center px-6">
			<div className="max-w-lg border-8 border-ink bg-white px-6 py-8 text-center">
				<p className="font-gothic text-xs tracking-[0.18em] uppercase">
					Indie Soul Fest
				</p>
				<h1 className="mt-3 font-display text-5xl leading-none uppercase">
					Página no encontrada
				</h1>
				<p className="mt-4 font-gothic leading-relaxed">
					Esa dirección no forma parte del festival.
				</p>
				<Link
					href="/"
					className="mt-6 inline-flex border-4 border-ink bg-ink px-4 py-3 font-display text-xl text-cream uppercase"
				>
					Volver a la portada
				</Link>
			</div>
		</div>
	);
}
