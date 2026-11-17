import { GameCard } from "@/components/games/game-card";
import { games } from "@/data/games";

export function GameCatalog() {
	return (
		<section id="catalogo" aria-labelledby="catalogo-titulo" className="mt-12">
			<h2 id="catalogo-titulo" className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none uppercase">
				Juegos de prueba
			</h2>
			<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{games.map((game) => (
					<li key={game.id}>
						<GameCard game={game} />
					</li>
				))}
			</ul>
		</section>
	);
}
