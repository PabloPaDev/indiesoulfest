import { Reveal } from "@/components/landing/reveal";
import styles from "./playnotes-integration.module.css";

const steps = [
	{
		number: "01",
		label: "DESCUBRE",
		text: "Explora los juegos seleccionados para el festival.",
	},
	{
		number: "02",
		label: "PRUEBA",
		text: "Accede a sus demos sin registrarte.",
	},
	{
		number: "03",
		label: "GUARDA",
		text: "Añade tus favoritos a tu wishlist de PlayNotes.",
	},
] as const;

const notes = [
	{
		label: "SIN CUENTA",
		text: "Entra, mira la selección y prueba demos. El festival está abierto desde el primer clic.",
	},
	{
		label: "CON PLAYNOTES",
		text: "Los juegos que te marquen pueden seguir contigo: wishlist, seguimiento y contexto cuando el festival termine.",
	},
	{
		label: "MISMA IDEA",
		text: "Indie Soul Fest no es solo un escaparate puntual. Es una puerta hacia cómo PlayNotes entiende el descubrir.",
	},
] as const;

export function PlayNotesIntegration() {
	return (
		<section className={styles.section} aria-labelledby="playnotes-title">
			<div className={styles.inner}>
				<Reveal>
					<header className={styles.header}>
						<h2 id="playnotes-title" className={styles.title}>
							DEL FESTIVAL A TU BIBLIOTECA.
						</h2>
						<p className={styles.subtitle}>Descubre aquí. Sigue jugando en PlayNotes.</p>
						<p className={styles.lead}>
							Puedes explorar los videojuegos y acceder a sus demos sin necesidad de registrarte.
						</p>
						<p className={styles.lead}>
							Y si tienes una cuenta de PlayNotes, podrás añadir los juegos que te interesen a tu lista de deseados, seguirles la pista y descubrir más sobre ellos incluso cuando Indie Soul Fest haya terminado.
						</p>
					</header>
				</Reveal>

				<Reveal>
					<ul className={styles.steps}>
						{steps.map((step) => (
							<li key={step.number} className={styles.step}>
								<span className={styles.stepNumber} aria-hidden="true">
									{step.number}
								</span>
								<div className={styles.stepCopy}>
									<p className={styles.stepLabel}>{step.label}</p>
									<p className={styles.stepText}>{step.text}</p>
								</div>
							</li>
						))}
					</ul>
				</Reveal>

				<Reveal>
					<div className={styles.notes}>
						{notes.map((note) => (
							<article key={note.label} className={styles.note}>
								<p className={styles.noteLabel}>{note.label}</p>
								<p className={styles.noteText}>{note.text}</p>
							</article>
						))}
					</div>
				</Reveal>

				<Reveal>
					<div className={styles.closing}>
						<p className={styles.closingText}>
							PlayNotes es el sitio donde esa partida descubierta puede convertirse en hábito: organizar, recordar y volver a los juegos que importan.
						</p>
						<a
							className={styles.button}
							href="https://www.playnotes.es/"
							target="_blank"
							rel="noopener noreferrer"
						>
							DESCUBRIR PLAYNOTES
							<span aria-hidden="true">→</span>
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
