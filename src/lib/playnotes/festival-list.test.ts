import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getPlaynotesListUrl, readPlaynotesListId } from "./festival-list";

describe("enlace de la lista en PlayNotes", () => {
	test("apunta a /app/list con el id de esa cuenta", () => {
		assert.equal(
			getPlaynotesListUrl("76edc154-234f-411d-90fa-fb5e3ced7b0d"),
			"https://www.playnotes.es/app/list/76edc154-234f-411d-90fa-fb5e3ced7b0d",
		);
	});

	test("lee el id que devuelve la API y ignora una lista vacía", () => {
		assert.equal(
			readPlaynotesListId({
				list: { id: "76edc154-234f-411d-90fa-fb5e3ced7b0d" },
			}),
			"76edc154-234f-411d-90fa-fb5e3ced7b0d",
		);
		assert.equal(readPlaynotesListId({ list: null }), null);
		assert.equal(readPlaynotesListId(null), null);
	});
});
