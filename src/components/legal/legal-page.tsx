import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import styles from "./legal-page.module.css";

const navItems = [
	{ href: "/legal", label: "Legal" },
	{ href: "/privacidad", label: "Privacidad" },
	{ href: "/cookies", label: "Cookies" },
	{ href: "/redes", label: "Redes" },
] as const;

type LegalPageProps = {
	title: string;
	eyebrow?: string;
	updated: string;
	activeHref: (typeof navItems)[number]["href"];
	children: ReactNode;
};

export function LegalPage({
	title,
	eyebrow = "Indie Soul Fest",
	updated,
	activeHref,
	children,
}: LegalPageProps) {
	return (
		<div className={styles.page}>
			<header className={styles.top}>
				<Link href="/" className={styles.brand}>
					{siteConfig.name}
				</Link>
				<nav className={styles.nav} aria-label="Documentos legales">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`${styles.navLink} ${
								item.href === activeHref ? styles.navLinkActive : ""
							}`}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</header>

			<main className={styles.main}>
				<p className={styles.eyebrow}>{eyebrow}</p>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.updated}>Última actualización: {updated}</p>
				<div className={styles.rule} aria-hidden="true" />
				{children}
				<Link href="/" className={styles.back}>
					← Volver al festival
				</Link>
			</main>
		</div>
	);
}

export function LegalSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>{title}</h2>
			{children}
		</section>
	);
}

export { styles as legalStyles };
