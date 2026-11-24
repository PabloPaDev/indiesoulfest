import { getPublishedFestivalGames } from "@/data/festivalCatalog";

/** Carrusel de la consola en la landing: cápsula horizontal oficial a pantalla completa. */
export type LandingGame = {
	id: string;
	title: string;
	studio: string;
	cover: string;
	/** `object-position` para mantener el logo dentro de la pantalla al recortar. */
	coverPosition: string;
	demo?: boolean;
};

/** Encuadres revisados a mano para que el logo quede dentro de la pantalla; el resto se centra. */
const COVER_POSITION: Record<string, string> = {
	"beep-below": "22% center",
	overexposed: "center bottom",
	"the-sky-project-land-of-noris": "left center",
	"sombras-negative-frames": "9% center",
	"swing-that-thing": "left center",
	noctheria: "left center",
	weefager: "90% center",
	"toymaker-threads-of-joy": "right center",
	"the-vast-white": "right center",
	"the-next-stop": "left center",
	skuld: "left center",
	"masc-mask-masked": "left center",
	fkc: "right center",
	"just-in-crime": "30% center",
	crownwalk: "center 40%",
	"runix-pinball-roguelike": "left center",
	"emery-hearts": "right center",
	"death-by-misstep": "75% center",
	"hound-riders": "left center",
	"no-vacancy-tonight": "90% center",
	"oink-splash-party": "20% center",
	bobots: "left center",
	mutter: "left center",
	blightrole: "40% center",
	cheesty: "right center",
	underpacked: "left center",
	"almazuela-picross": "right center",
	abanto: "22% center",
};

/** Logos más anchos que la pantalla en la cápsula principal: hero capsule oficial de Steam (748×896). */
const COVER_SOURCE: Record<string, string> = {
	crownwalk:
		"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4703900/16aee2b00a4e79adc7b5827cf6e7b074870f3eca/hero_capsule_2x.jpg?t=1793547022",
	overexposed:
		"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/5067460/2eb8b2fe6f01a17049b8b96cd3cd53a5283caa55/hero_capsule_2x.jpg?t=1794163463",
};

export const landingGames: LandingGame[] = getPublishedFestivalGames().flatMap(
	(game) => {
		const cover =
			COVER_SOURCE[game.id] ??
			game.mainCapsule ??
			game.coverImage ??
			game.trailerPoster;
		if (!cover || !game.title) return [];
		const entry: LandingGame = {
			id: game.id,
			title: game.title,
			studio: game.studio ?? "",
			cover,
			coverPosition: COVER_POSITION[game.id] ?? "center",
			demo: !!game.demoUrl,
		};
		return [entry];
	},
);
