import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./landing-footer.module.css";

const legalLinks = [
	{ href: "/legal", label: "Legal" },
	{ href: "/privacidad", label: "Privacidad" },
	{ href: "/cookies", label: "Cookies" },
	{ href: "/redes", label: "Redes" },
] as const;

export function LandingFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.brandBlock}>
					<p className={styles.brand}>Indie Soul Fest {siteConfig.editionYear}</p>
					<p className={styles.meta}>
						Organizado por {siteConfig.organizers}
					</p>
					<p className={styles.meta}>
						{siteConfig.dates.label} de {siteConfig.editionYear}
					</p>
				</div>

				<div className={styles.linksBlock}>
					<a
						className={styles.link}
						href={siteConfig.playnotesUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						PlayNotes
					</a>
					<nav className={styles.placeholders} aria-label="Documentos legales">
						{legalLinks.map((item) => (
							<Link key={item.href} href={item.href} className={styles.footerLegal}>
								{item.label}
							</Link>
						))}
					</nav>
				</div>

				<p className={styles.credit}>Diseño del cartel: EdithMT_Design</p>
			</div>
		</footer>
	);
}
