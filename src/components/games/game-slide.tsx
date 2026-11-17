import { ScreenMotif } from "@/components/graphics/screen-motif";
import type { Game } from "@/types/game";

type GameSlideProps = {
	game: Game;
};

/** La imagen ocupa toda la pantalla. El nombre vive fuera, en el pie de la consola. */
export function GameSlide({ game }: GameSlideProps) {
	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			<ScreenMotif motif={game.motif} />
			<p className="sr-only">
				{game.title}, {game.studio}
			</p>
		</div>
	);
}
