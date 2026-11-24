import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Privacidad",
	description: `Política de privacidad de ${siteConfig.name} ${siteConfig.editionYear}.`,
	alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
	return (
		<LegalPage
			title="Privacidad"
			updated="24 de noviembre de 2026"
			activeHref="/privacidad"
		>
			<LegalSection title="1. Responsable">
				<p>
					El tratamiento de datos asociado a {siteConfig.name} es responsabilidad
					de los organizadores del festival ({siteConfig.organizers}).
				</p>
				<p>
					Contacto:{" "}
					<a href={`mailto:${siteConfig.contactEmail}`}>
						{siteConfig.contactEmail}
					</a>
					.
				</p>
			</LegalSection>

			<LegalSection title="2. Qué datos tratamos">
				<p>En este sitio, de forma habitual, pueden tratarse:</p>
				<ul>
					<li>
						Datos técnicos mínimos de navegación (dirección IP, tipo de
						navegador, páginas visitadas) cuando el alojamiento o la infraestructura
						los registren por seguridad y funcionamiento.
					</li>
					<li>
						Preferencias locales del festival, como la lista de juegos guardada
						en tu navegador (localStorage), que no se envía automáticamente a
						nuestros servidores.
					</li>
					<li>
						Si inicias sesión o usas funciones de cuenta a través de PlayNotes,
						los datos de cuenta se tratan en PlayNotes conforme a su propia
						política de privacidad.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="3. Finalidades">
				<ul>
					<li>Mostrar el festival, catálogo y demos.</li>
					<li>Recordar tu selección local de juegos del festival.</li>
					<li>
						Permitir, si lo eliges, continuar la experiencia en PlayNotes
						(wishlist, biblioteca u otras funciones de esa plataforma).
					</li>
					<li>Mantener la seguridad y el rendimiento del sitio.</li>
				</ul>
			</LegalSection>

			<LegalSection title="4. Base jurídica">
				<p>
					El tratamiento se basa, según el caso, en el interés legítimo de
					ofrecer el festival digital, en la ejecución de medidas precontractuales
					o de servicio cuando usas funciones de cuenta, y en tu consentimiento
					cuando sea necesario (por ejemplo, cookies no esenciales).
				</p>
			</LegalSection>

			<LegalSection title="5. Conservación">
				<p>
					Los registros técnicos se conservan el tiempo necesario para seguridad
					y operación. La lista local del festival permanece en tu dispositivo
					hasta que la borres o limpies el almacenamiento del navegador.
				</p>
			</LegalSection>

			<LegalSection title="6. Destinatarios">
				<p>
					Pueden intervenir proveedores de alojamiento, CDN o analítica técnica
					estrictamente necesarios para operar el sitio. Los enlaces a Steam,
					itch.io, YouTube u otros servicios implican que esos terceros traten
					datos bajo sus propias políticas cuando interactúas con ellos.
				</p>
				<p>
					PlayNotes es un destinatario relevante si usas login o guardado de
					listas en esa plataforma:{" "}
					<a href={siteConfig.playnotesUrl} rel="noopener noreferrer" target="_blank">
						playnotes.es
					</a>
					.
				</p>
			</LegalSection>

			<LegalSection title="7. Derechos">
				<p>
					Puedes solicitar acceso, rectificación, supresión, oposición,
					limitación u portabilidad cuando proceda, escribiendo a{" "}
					<a href={`mailto:${siteConfig.contactEmail}`}>
						{siteConfig.contactEmail}
					</a>
					. También puedes reclamar ante la Agencia Española de Protección de
					Datos (AEPD).
				</p>
			</LegalSection>

			<LegalSection title="8. Cookies">
				<p>
					El detalle sobre cookies y almacenamiento local está en la{" "}
					<a href="/cookies">política de cookies</a>.
				</p>
			</LegalSection>

			<LegalSection title="9. Menores">
				<p>
					El festival está dirigido a público general interesado en videojuegos.
					Si eres menor, utiliza el sitio con supervisión de un adulto cuando
					proceda según tu país.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
