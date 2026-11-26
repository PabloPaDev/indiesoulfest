/**
 * Colaboradores internacionales de difusión.
 * No son patrocinadores ni parte de la selección oficial:
 * no deben entrar en el catálogo, el carrusel ni el cupo de juegos.
 */
export type CollaboratorGame = {
	id: string;
	title: string;
	description: string;
	image: string;
	imageWidth: number;
	imageHeight: number;
	portraitImage?: string;
	portraitWidth?: number;
	portraitHeight?: number;
	storeName: string;
	storeUrl: string;
};

export type CollaboratorLogo = {
	src: string;
	width: number;
	height: number;
	/** Recorte del margen transparente, en píxeles del archivo. */
	crop: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
};

export type InternationalCollaborator = {
	id: string;
	name: string;
	role: string;
	description: string;
	logo: CollaboratorLogo;
	profileUrl: string;
	profileLabel: string;
	games: readonly CollaboratorGame[];
};

export const internationalCollaborators: readonly InternationalCollaborator[] = [
	{
		id: "pone-games",
		name: "PONE GAMES",
		role: "Colaborador internacional de difusión.",
		description:
			"Publisher independiente que colabora con Indie Soul Fest para dar visibilidad internacional a los videojuegos independientes españoles.",
		logo: {
			src: "/collaborators/pone-games.png",
			width: 1000,
			height: 1000,
			crop: { x: 26, y: 283, width: 948, height: 470 },
		},
		profileUrl: "https://x.com/MANXIAF",
		profileLabel: "Perfil oficial",
		games: [
			{
				id: "dashoot-abyas-adventure",
				title: "Dashoot: ABYA’s Adventure",
				description:
					"Plataformas de precisión en el que controlas a un pequeño robot y apuntas con su cañón flotante en pleno salto.",
				image: "/collaborators/dashoot-header.jpg",
				imageWidth: 460,
				imageHeight: 215,
				portraitImage: "/collaborators/dashoot-portrait.jpg",
				portraitWidth: 600,
				portraitHeight: 900,
				storeName: "Steam",
				storeUrl: "https://store.steampowered.com/app/2670430/",
			},
			{
				id: "cat-squeeze",
				title: "Cat Squeeze",
				description: "Juego de puzles en el que tendrás que mover gatos para abrirte paso.",
				image: "/collaborators/cat-squeeze-header.jpg",
				imageWidth: 460,
				imageHeight: 215,
				storeName: "Steam",
				storeUrl: "https://store.steampowered.com/app/3739300/",
			},
		],
	},
];
