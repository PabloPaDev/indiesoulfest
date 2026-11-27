import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mergeGameIds } from "./festival-list-storage";
import {
	auditFestivalIgdbIds,
	festivalGameIdsFromRemoteGames,
	festivalGameIdsFromRemoteIgdb,
	isSyncableFestivalGame,
	isValidIgdbId,
	isValidPlaynotesGameId,
} from "./igdb-audit";
import type { FestivalGame } from "@/types/festival-game";

describe("mergeGameIds", () => {
	test("combina sin duplicados preservando orden", () => {
		assert.deepEqual(mergeGameIds(["a", "b"], ["b", "c"], ["a", "d"]), [
			"a",
			"b",
			"c",
			"d",
		]);
	});
});

describe("playnotes uuid sync", () => {
	test("valida UUID e IGDB", () => {
		assert.equal(isValidIgdbId(null), false);
		assert.equal(isValidIgdbId(0), false);
		assert.equal(isValidIgdbId(12.5), false);
		assert.equal(isValidIgdbId(123), true);
		assert.equal(isValidPlaynotesGameId(null), false);
		assert.equal(isValidPlaynotesGameId("not-a-uuid"), false);
		assert.equal(
			isValidPlaynotesGameId("0ddb3583-19b7-4598-b6b5-8b4ff5cf677f"),
			true,
		);
	});

	test("los 42 juegos del catálogo son sincronizables por UUID", () => {
		const audit = auditFestivalIgdbIds();
		assert.equal(audit.total, 42);
		assert.equal(audit.syncable.length, 42);
		assert.equal(audit.unsyncable.length, 0);
		assert.ok(audit.valid.length >= 30);
		const sample = audit.syncable.find((row) => row.id === "the-sample");
		const carmina = audit.syncable.find((row) => row.id === "carmina");
		assert.ok(sample);
		assert.equal(sample.valid, false);
		assert.ok(carmina);
		assert.equal(carmina.valid, false);
	});

	test("mapea UUID remoto a ids de festival (con fallback IGDB)", () => {
		const games = [
			{
				id: "one",
				playnotesGameId: "11111111-1111-4111-8111-111111111111",
				igdbId: 10,
			},
			{
				id: "two",
				playnotesGameId: "22222222-2222-4222-8222-222222222222",
				igdbId: null,
			},
			{ id: "three", playnotesGameId: null, igdbId: 30 },
		] as FestivalGame[];

		assert.deepEqual(
			festivalGameIdsFromRemoteGames(games, [
				{ gameId: "22222222-2222-4222-8222-222222222222" },
				{ gameId: "11111111-1111-4111-8111-111111111111", igdbId: 10 },
				{ igdbId: 30 },
				{ gameId: "99999999-9999-4999-8999-999999999999" },
			]),
			["two", "one", "three"],
		);

		assert.deepEqual(festivalGameIdsFromRemoteIgdb(games, [30, 10, 99, 10]), [
			"three",
			"one",
		]);
		assert.equal(isSyncableFestivalGame(games[1]), true);
		assert.equal(isSyncableFestivalGame(games[2]), false);
	});
});
