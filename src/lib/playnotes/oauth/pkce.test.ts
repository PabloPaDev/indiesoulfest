import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
	createCodeChallenge,
	generateCodeVerifier,
	generateState,
} from "./pkce";

describe("PKCE S256", () => {
	test("verifier tiene longitud base64url razonable", () => {
		const verifier = generateCodeVerifier();
		assert.ok(verifier.length >= 43 && verifier.length <= 128);
		assert.match(verifier, /^[A-Za-z0-9\-_]+$/);
	});

	test("challenge S256 es determinista para el mismo verifier", () => {
		const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
		const a = createCodeChallenge(verifier);
		const b = createCodeChallenge(verifier);
		assert.equal(a, b);
		assert.equal(a, "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
	});

	test("state es aleatorio", () => {
		const a = generateState();
		const b = generateState();
		assert.notEqual(a, b);
	});
});
