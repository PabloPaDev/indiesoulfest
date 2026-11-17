/** Dibujo de la consola. La pantalla es el rectángulo central. */
export const consoleViewBox = {
	width: 959,
	height: 336,
} as const;

export const consoleScreen = {
	x: 236,
	y: 21,
	width: 488,
	height: 292,
	rx: 4,
} as const;

export function screenSlotStyle() {
	return {
		left: `${(consoleScreen.x / consoleViewBox.width) * 100}%`,
		top: `${(consoleScreen.y / consoleViewBox.height) * 100}%`,
		width: `${(consoleScreen.width / consoleViewBox.width) * 100}%`,
		height: `${(consoleScreen.height / consoleViewBox.height) * 100}%`,
		borderRadius: `${(consoleScreen.rx / consoleScreen.width) * 100}%`,
	};
}
