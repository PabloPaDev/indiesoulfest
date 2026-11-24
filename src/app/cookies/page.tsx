import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Cookies",
	description: `Política de cookies de ${siteConfig.name} ${siteConfig.editionYear}.`,
	alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
	return (
		<LegalPage
			title="Cookies"
			updated="24 de noviembre de 2026"
			activeHref="/cookies"
		>
			<LegalSection title="1. Qué son">
				<p>
					Las cookies y tecnologías similares (como el almacenamiento local del
					navegador) permiten recordar preferencias, mantener sesiones o medir
					el uso del sitio.
				</p>
			</LegalSection>

			<LegalSection title="2. Qué usamos en Indie Soul Fest">
				<ul>
					<li>
						<strong>Almacenamiento local del festival:</strong> la lista de
						juegos que añades a «Mi lista» se guarda en tu navegador para que no
						se pierda al recargar. Es un dato funcional en tu dispositivo.
					</li>
					<li>
						<strong>Cookies técnicas / de sesión:</strong> si entras con
						cuenta a través de PlayNotes, esa plataforma puede establecer
						cookies de autenticación necesarias para mantener la sesión.
					</li>
					<li>
						<strong>Proveedores embebidos:</strong> al reproducir tráilers de
						YouTube o abrir demos en Steam/itch.io, esos servicios pueden
						colocar sus propias cookies.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="3. Finalidad">
				<p>
					Operar el festival, recordar tu selección local y, si corresponde,
					permitir el acceso autenticado vía PlayNotes. No usamos cookies
					propias de publicidad comportamental en este sitio.
				</p>
			</LegalSection>

			<LegalSection title="4. Cómo gestionarlas">
				<p>
					Puedes borrar cookies y datos de sitio desde la configuración de tu
					navegador. Si eliminas el almacenamiento local, se perderá «Mi lista»
					del festival en ese dispositivo.
				</p>
				<p>
					Para la gestión de cookies de PlayNotes u otros terceros, consulta
					sus propias políticas.
				</p>
			</LegalSection>

			<LegalSection title="5. Más información">
				<p>
					Consulta también la{" "}
					<a href="/privacidad">política de privacidad</a> y el{" "}
					<a href="/legal">aviso legal</a>. Contacto:{" "}
					<a href={`mailto:${siteConfig.contactEmail}`}>
						{siteConfig.contactEmail}
					</a>
					.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
