import { ScreenMotif } from "@/components/graphics/screen-motif";
import { GameLibraryActions } from "@/components/playnotes/game-library-actions";
import type { Game } from "@/types/game";

type GameCardProps = {
	game: Game;
};

export function GameCard({ game }: GameCardProps) {
	return (
		<article className="flex h-full flex-col border-[3px] border-ink bg-white">
			<div className="relative aspect-[16/10] overflow-hidden border-b-[3px] border-ink bg-black">
				<ScreenMotif motif={game.motif} />
				{game.demo ? (
					<p className="absolute top-3 left-3 border-2 border-white px-2 py-1 font-pixel text-[0.7rem] text-white">
						Demo
					</p>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<h2 className="font-display text-[clamp(1.45rem,2vw,1.9rem)] leading-none uppercase">
					{game.title}
				</h2>
				<p className="font-gothic text-sm tracking-[0.06em] uppercase">
					{game.studio}
				</p>
				<p className="mt-auto inline-flex w-fit border-2 border-ink px-2 py-1 font-gothic text-[0.68rem] tracking-[0.16em] uppercase">
					{game.genre}
				</p>
				<GameLibraryActions
					playnotesGameId={game.playnotesGameId}
					igdbId={game.igdbId}
					demoUrl={game.demoUrl}
					demoStore={game.demoStore}
				/>
			</div>
		</article>
	);
}
