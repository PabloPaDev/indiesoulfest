/**
 * Contenido de ejemplo: sustitúyelo por títulos y material autorizado
 * de los presskits de los estudios participantes antes de publicar.
 */
export type LandingGame = {
  id: string;
  title: string;
  studio: string;
  image: string;
  demo?: boolean;
};

export const landingGames: LandingGame[] = [
  {
    id: "orbita-menor",
    title: "ORBITA MENOR",
    studio: "Estudio Lumen",
    image: "/console/cover-still.png",
    demo: true,
  },
  {
    id: "preview-01",
    title: "TU PRIMER JUEGO",
    studio: "PREVISUALIZACIÓN DEL FESTIVAL",
    image: "/festival/presskit-placeholder.svg",
    demo: true,
  },
  {
    id: "preview-02",
    title: "PRÓXIMAMENTE",
    studio: "AQUÍ IRÁ UN ESTUDIO PARTICIPANTE",
    image: "/festival/presskit-placeholder-2.svg",
    demo: true,
  },
];
