import type { Metadata } from "next";
import {
	LegalPage,
	LegalSection,
	legalStyles,
} from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Redes",
	description: `Redes y contacto de ${siteConfig.name} ${siteConfig.editionYear}.`,
	alternates: { canonical: "/redes" },
};

export default function SocialPage() {
	return (
		<LegalPage
			title="Redes"
			updated="24 de noviembre de 2026"
			activeHref="/redes"
		>
			<LegalSection title="Síguenos">
				<p>
					{siteConfig.name} lo organizan {siteConfig.organizers}. Aquí tienes
					los canales oficiales para estar al día del festival y de la
					comunidad.
				</p>
				<ul className={legalStyles.socialList}>
					{siteConfig.social.map((item) => (
						<li key={item.href}>
							<a
								className={legalStyles.socialLink}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								<span>{item.label}</span>
								<span aria-hidden="true">→</span>
							</a>
						</li>
					))}
				</ul>
			</LegalSection>

			<LegalSection title="Contacto">
				<p>
					Para prensa, estudios o dudas del festival:{" "}
					<a href={`mailto:${siteConfig.contactEmail}`}>
						{siteConfig.contactEmail}
					</a>
					.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
