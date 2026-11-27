import { createHash, randomBytes } from "node:crypto";

/** Genera un code_verifier PKCE (43–128 chars, base64url). */
export function generateCodeVerifier(bytes = 32): string {
	return base64Url(randomBytes(bytes));
}

export function generateState(bytes = 24): string {
	return base64Url(randomBytes(bytes));
}

/** S256: BASE64URL(SHA256(verifier)). */
export function createCodeChallenge(verifier: string): string {
	const digest = createHash("sha256").update(verifier, "ascii").digest();
	return base64Url(digest);
}

export function generateCsrfToken(bytes = 24): string {
	return base64Url(randomBytes(bytes));
}

function base64Url(buf: Buffer): string {
	return buf
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}
