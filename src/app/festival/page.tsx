import type { Metadata } from "next";
import { connection } from "next/server";
import { FestivalNotOpenScreen } from "@/components/festival/festival-not-open";
import { FestivalShell } from "@/components/festival/festival-shell";
import { FestivalExperience } from "@/components/festival/festival-experience";
import { isFestivalOpen } from "@/lib/festival-opening";

export const metadata: Metadata = {
	title: "El festival",
	description:
		"Explora Indie Soul Fest 2026 y descubre demos de videojuegos independientes. Catálogo editorial, del 1 al 31 de diciembre de 2026.",
	alternates: {
		canonical: "/festival",
	},
};

function playnotesReturnStatus(
	value: string | string[] | undefined,
): "connected" | "error" | null {
	const status = Array.isArray(value) ? value[0] : value;
	if (status === "connected" || status === "error") return status;
	return null;
}

export default async function FestivalPage({
	searchParams,
}: {
	searchParams: Promise<{ playnotes?: string | string[] }>;
}) {
	await connection();
	if (!isFestivalOpen()) {
		const params = await searchParams;
		return (
			<FestivalNotOpenScreen returnStatus={playnotesReturnStatus(params.playnotes)} />
		);
	}

	return (
		<FestivalShell>
			<FestivalExperience />
		</FestivalShell>
	);
}
