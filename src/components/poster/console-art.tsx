import {
	consoleScreen,
	consoleViewBox,
} from "@/components/poster/console-geometry";

/**
 * Silueta del modelo de referencia: cuerpo ancho,
 * cruceta y botón a la izquierda, pantalla central,
 * botones y paneles a los lados.
 */
export function ConsoleArt() {
	const { width, height } = consoleViewBox;
	const screen = consoleScreen;

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className="block h-auto w-full"
			aria-hidden="true"
		>
			<path
				d="M 88 16 H 1112 A 72 72 0 0 1 1184 88 V 392 A 88 72 0 0 1 1096 464 H 104 A 88 72 0 0 1 16 392 V 88 A 72 72 0 0 1 88 16 Z"
				fill="#ffffff"
				stroke="#000000"
				strokeWidth="14"
			/>
			<rect
				x={screen.x}
				y={screen.y}
				width={screen.width}
				height={screen.height}
				rx={screen.rx}
				fill="#000000"
			/>
			<g transform="translate(108 92)" fill="#000000">
				<rect x="-13" y="-40" width="26" height="80" rx="7" />
				<rect x="-40" y="-13" width="80" height="26" rx="7" />
			</g>
			<circle cx="214" cy="92" r="24" fill="#000000" />
			<rect
				x="168"
				y="196"
				width="156"
				height="148"
				rx="22"
				fill="#000000"
			/>
			<circle cx="986" cy="92" r="28" fill="#000000" />
			<g transform="translate(1112 92)" fill="#000000">
				<circle cx="0" cy="-30" r="12" />
				<circle cx="30" cy="0" r="12" />
				<circle cx="0" cy="30" r="12" />
				<circle cx="-30" cy="0" r="12" />
			</g>
			<rect
				x="986"
				y="196"
				width="156"
				height="148"
				rx="22"
				fill="#000000"
			/>
		</svg>
	);
}
