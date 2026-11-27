import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
	FESTIVAL_OPENS_AT,
	festivalOpeningLabel,
	isFestivalOpen,
} from "./festival-opening";

describe("apertura del festival", () => {
	test("la marca es el 1 de diciembre de 2026 a las 16:00 en Madrid", () => {
		assert.equal(FESTIVAL_OPENS_AT, "2026-12-01T16:00:00+01:00");
		assert.match(festivalOpeningLabel(), /1 de diciembre a las 16:00/);
	});

	test("sigue cerrado un minuto antes", () => {
		assert.equal(isFestivalOpen(new Date("2026-12-01T15:59:00+01:00")), false);
		assert.equal(isFestivalOpen(new Date("2026-11-27T13:00:00+01:00")), false);
	});

	test("abre en el instante indicado y se mantiene abierto", () => {
		assert.equal(isFestivalOpen(new Date("2026-12-01T16:00:00+01:00")), true);
		assert.equal(isFestivalOpen(new Date("2026-12-01T15:00:00Z")), true);
		assert.equal(isFestivalOpen(new Date("2026-12-31T23:00:00+01:00")), true);
	});
});
