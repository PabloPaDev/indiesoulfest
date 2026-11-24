import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Aviso legal",
	description: `Aviso legal de ${siteConfig.name} ${siteConfig.editionYear}.`,
	alternates: { canonical: "/legal" },
};

export default function LegalNoticePage() {
	return (
		<LegalPage
			title="Aviso legal"
			updated="24 de noviembre de 2026"
			activeHref="/legal"
		>
			<LegalSection title="1. Titular del sitio">
				<p>
					El sitio web de {siteConfig.name} ({siteConfig.publicDomain} y{" "}
					{siteConfig.catalogDomain}) es un festival digital de videojuegos
					independientes organizado por {siteConfig.organizers}.
				</p>
				<p>
					Para cualquier consulta relacionada con este sitio puedes escribir a{" "}
					<a href={`mailto:${siteConfig.contactEmail}`}>
						{siteConfig.contactEmail}
					</a>
					.
				</p>
			</LegalSection>

			<LegalSection title="2. Objeto">
				<p>
					{siteConfig.name} tiene carácter informativo y cultural: presentar una
					selección de videojuegos independientes, facilitar el acceso a demos
					cuando estén disponibles y orientar a los visitantes hacia PlayNotes
					para descubrir, guardar y seguir juegos.
				</p>
			</LegalSection>

			<LegalSection title="3. Condiciones de uso">
				<p>
					El acceso al sitio es gratuito. El usuario se compromete a hacer un
					uso lícito del contenido y a no emplearlo de forma que dañe, inutilice
					o sobrecargue el servicio, ni que vulnere derechos de terceros.
				</p>
				<p>
					Parte de las funciones de cuenta, biblioteca o listas puede requerir
					autenticación en{" "}
					<a href={siteConfig.playnotesUrl} rel="noopener noreferrer" target="_blank">
						PlayNotes
					</a>
					. En ese caso aplican también las condiciones y políticas de
					PlayNotes.
				</p>
			</LegalSection>

			<LegalSection title="4. Propiedad intelectual">
				<p>
					La marca {siteConfig.name}, el diseño del sitio, textos propios y
					materiales gráficos del festival pertenecen a sus organizadores o a
					quien corresponda, salvo indicación contraria.
				</p>
				<p>
					Los videojuegos, demos, capturas, tráilers y marcas de cada estudio
					siguen siendo propiedad de sus respectivos titulares. Su aparición en
					el festival no implica cesión de derechos más allá de la difusión
					autorizada para el evento.
				</p>
				<p>
					Diseño del cartel: {siteConfig.designer}.
				</p>
			</LegalSection>

			<LegalSection title="5. Enlaces a terceros">
				<p>
					El sitio puede enlazar a Steam, itch.io, YouTube, PlayNotes u otras
					plataformas. {siteConfig.name} no controla esos servicios ni se hace
					responsable de sus contenidos, disponibilidad o políticas.
				</p>
			</LegalSection>

			<LegalSection title="6. Exención de responsabilidad">
				<p>
					Se procura mantener la información actualizada, pero no se garantiza
					la ausencia de errores, interrupciones o cambios en demos, enlaces o
					fechas comunicadas por terceros.
				</p>
			</LegalSection>

			<LegalSection title="7. Legislación aplicable">
				<p>
					Salvo norma imperativa en contrario, estas condiciones se interpretan
					conforme a la legislación española. Para reclamaciones relacionadas
					con datos personales, consulta la{" "}
					<a href="/privacidad">política de privacidad</a>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
