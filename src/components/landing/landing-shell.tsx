import type { ReactNode } from "react";
import styles from "./landing-shell.module.css";

type LandingShellProps = {
	hero: ReactNode;
	behind: ReactNode;
	after: ReactNode;
	footer: ReactNode;
};

/** Secciones en orden: la portada, lo que hay detrás, PlayNotes y el pie. */
export function LandingShell({ hero, behind, after, footer }: LandingShellProps) {
	return (
		<div className={styles.shell}>
			<section className={`${styles.layer} ${styles.heroLayer}`} aria-label="Portada">
				{hero}
			</section>

			<section
				id="landing-after"
				className={`${styles.layer} ${styles.behindLayer}`}
				aria-label="Detrás del festival"
			>
				{behind}
			</section>

			<section
				className={`${styles.layer} ${styles.coverLayer}`}
				aria-label="Integración con PlayNotes"
			>
				{after}
			</section>

			<div className={styles.footerBand}>{footer}</div>
		</div>
	);
}
