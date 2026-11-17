import type { Game } from "@/types/game";

/**
 * Catálogo provisional.
 * Los nombres son ficticios y están marcados como datos de prueba.
 * No representan juegos, estudios ni marcas reales.
 */
export const games: Game[] = [
	{
		id: "prueba-bruma-de-sal",
		title: "Bruma de Sal",
		studio: "Taller Provisional Norte",
		genre: "Aventura",
		demo: true,
		motif: "cluster",
		provisional: true,
	},
	{
		id: "prueba-orbita-menor",
		title: "Órbita Menor",
		studio: "Estudio Lumen de Prueba",
		genre: "Puzle",
		demo: true,
		motif: "orbit",
		provisional: true,
	},
	{
		id: "prueba-calle-jones",
		title: "Calle Jones",
		studio: "Colectivo Demostración",
		genre: "Narrativa",
		demo: true,
		motif: "bars",
		provisional: true,
	},
	{
		id: "prueba-reloj-de-cieno",
		title: "Reloj de Cieno",
		studio: "Banco de Pruebas Sur",
		genre: "Exploración",
		demo: false,
		motif: "ring",
		provisional: true,
	},
	{
		id: "prueba-radio-farol",
		title: "Radio Farol",
		studio: "Casa de Demos Este",
		genre: "Simulación",
		demo: true,
		motif: "signal",
		provisional: true,
	},
	{
		id: "prueba-nido-de-tinta",
		title: "Nido de Tinta",
		studio: "Atelier Ficticio",
		genre: "Plataformas",
		demo: true,
		motif: "pills",
		provisional: true,
	},
	{
		id: "prueba-mapa-de-humo",
		title: "Mapa de Humo",
		studio: "Laboratorio Provisional",
		genre: "Estrategia",
		demo: true,
		motif: "cross",
		provisional: true,
	},
	{
		id: "prueba-ultima-farola",
		title: "Última Farola",
		studio: "Grupo Ensayo Oeste",
		genre: "Misterio",
		demo: false,
		motif: "dots",
		provisional: true,
	},
];

export function getGameById(id: string) {
	return games.find((game) => game.id === id) ?? games[0];
}
