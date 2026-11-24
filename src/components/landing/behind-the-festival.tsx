import Image from "next/image";
import { Reveal } from "@/components/landing/reveal";
import { forPlayPretend } from "@/lib/display-text";
import styles from "./behind-the-festival.module.css";

const sectionTitle = "DETRÁS DEL FESTIVAL TAMBIÉN HAY PERSONAS.";

const columns = [
	{
		number: "01",
		category: "COMUNIDAD",
		org: "CARLOSEDIT.TV / PLAYNOTES",
		title: "UNA COMUNIDAD QUE COMPARTE LA PASIÓN POR LOS VIDEOJUEGOS.",
		body: [
			"CarlosEdit.tv y PlayNotes aportan al festival su experiencia en divulgación, comunidad y la forma en que los jugadores descubren y comparten videojuegos.",
			"Juntos buscan que los proyectos de pequeños estudios lleguen a nuevas personas, ofreciendo visibilidad a juegos que merecen ser conocidos.",
		],
	},
	{
		number: "02",
		category: "PLATAFORMA",
		org: "PABLO / PLAYNOTES",
		title: "MUCHO MÁS QUE JUGAR. DESCUBRIR, COMPARTIR Y RECORDAR.",
		body: [
			"PlayNotes nace como un espacio donde los jugadores pueden construir su propia historia con los videojuegos: descubrir títulos, organizar sus bibliotecas, escribir reseñas y compartir experiencias.",
			"Como creador de PlayNotes, quiero que esa filosofía también forme parte del festival. Porque descubrir un buen juego es solo el principio.",
		],
	},
	{
		number: "03",
		category: "EL FESTIVAL",
		org: "INDIE SOUL FEST",
		title: "UN ESCAPARATE PARA EL TALENTO INDEPENDIENTE.",
		body: [
			"Durante diciembre reunimos una selección de videojuegos independientes españoles con demos jugables y arte desarrollado sin IA generativa.",
			"Queremos dar protagonismo a las personas detrás de cada proyecto, acercar sus juegos al público y ofrecer un lugar donde descubrir propuestas hechas con personalidad y dedicación.",
		],
	},
] as const;

export function BehindTheFestival() {
	return (
		<section className={styles.section} aria-labelledby="behind-title">
			<div className={styles.inner}>
				<Reveal>
					<header className={styles.header}>
						<div className={styles.headerCopy}>
							<h2 id="behind-title" className={styles.title} aria-label={sectionTitle}>
								{forPlayPretend(sectionTitle)}
							</h2>
							<div className={styles.mascots} aria-hidden="true">
								<Image
									src="/mascots/beanie.png"
									alt=""
									width={600}
									height={600}
									className={`${styles.mascot} ${styles.mascotBeanie}`}
									sizes="(max-width: 900px) 96px, 380px"
									priority={false}
								/>
								<Image
									src="/mascots/onion-knight.png"
									alt=""
									width={600}
									height={600}
									className={`${styles.mascot} ${styles.mascotKnight}`}
									sizes="(max-width: 900px) 104px, 420px"
									priority={false}
								/>
							</div>
							<p className={styles.subtitle}>
								Unimos divulgación, comunidad y tecnología para dar visibilidad a videojuegos que merecen ser descubiertos.
							</p>
							<div className={styles.rule} aria-hidden="true" />
						</div>
					</header>
				</Reveal>

				<div className={styles.columns}>
					{columns.map((column) => (
						<article key={column.number} className={styles.column}>
							<Reveal className={styles.columnInner}>
								<span className={styles.number} aria-hidden="true">
									{column.number}
								</span>
								<p className={styles.category}>{column.category}</p>
								<p className={styles.org}>{column.org}</p>
								<h3 className={styles.columnTitle} aria-label={column.title}>
									{forPlayPretend(column.title)}
								</h3>
								{column.body.map((paragraph) => (
									<p key={paragraph.slice(0, 32)} className={styles.body}>
										{paragraph}
									</p>
								))}
							</Reveal>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
