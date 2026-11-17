/** Play Pretend no incluye tildes ni eñes: quita diacríticos solo para el dibujo. */
export function forPlayPretend(text: string): string {
	return text.normalize("NFD").replace(/\p{M}/gu, "");
}
