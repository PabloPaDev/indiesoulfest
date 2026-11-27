/**
 * Apertura pública del festival: 1 de diciembre de 2026, 16:00 (CET, Madrid).
 * El desfase +01:00 es el de la península en diciembre.
 */
export const FESTIVAL_OPENS_AT = "2026-12-01T16:00:00+01:00";

export function isFestivalOpen(now: Date = new Date()): boolean {
	return now.getTime() >= Date.parse(FESTIVAL_OPENS_AT);
}

/** Fecha y hora de apertura, en hora de Madrid, para el aviso de la portada. */
export function festivalOpeningLabel(locale = "es-ES"): string {
	const when = new Date(FESTIVAL_OPENS_AT);
	const date = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "long",
		timeZone: "Europe/Madrid",
	}).format(when);
	const time = new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		timeZone: "Europe/Madrid",
	}).format(when);
	return `${date} a las ${time} (hora de Madrid)`;
}
