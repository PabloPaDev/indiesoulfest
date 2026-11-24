import type { Metadata } from "next";
import { FestivalShell } from "@/components/festival/festival-shell";
import { FestivalExperience } from "@/components/festival/festival-experience";

export const metadata: Metadata = {
	title: "El festival",
	description:
		"Explora Indie Soul Fest 2026 y descubre demos de videojuegos independientes. Catálogo editorial, del 1 al 31 de diciembre de 2026.",
	alternates: {
		canonical: "/festival",
	},
};

export default function FestivalPage() {
	return (
		<FestivalShell>
			<FestivalExperience />
		</FestivalShell>
	);
}
