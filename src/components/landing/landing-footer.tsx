import { siteConfig } from "@/config/site";
import styles from "./landing-footer.module.css";

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
						href="https://www.playnotes.es/"
						target="_blank"
						rel="noopener noreferrer"
					>
						PlayNotes
					</a>
					<div className={styles.placeholders} aria-label="Enlaces futuros">
						<span className={styles.placeholder}>Legal</span>
						<span className={styles.placeholder}>Privacidad</span>
						<span className={styles.placeholder}>Redes</span>
					</div>
				</div>

				<p className={styles.credit}>Diseño del cartel: EdithMT_Design</p>
			</div>
		</footer>
	);
}
