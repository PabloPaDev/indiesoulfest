import type { ReactNode } from "react";
import styles from "./landing-shell.module.css";

type LandingShellProps = {
	hero: ReactNode;
	behind: ReactNode;
	after: ReactNode;
	footer: ReactNode;
};

/** Capas apiladas: cada sección se queda fija y la siguiente la cubre desde abajo.
 *  El footer va después, debajo de la última sección. */
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
				<div className={styles.coverBody}>{after}</div>
			</section>

			<div className={styles.footerBand}>{footer}</div>
		</div>
	);
}
