import Link from "next/link";
import { forPlayPretend } from "@/lib/display-text";
import styles from "./festival-header.module.css";

export function FestivalHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					<span className={styles.name} aria-label="Indie Soul Fest">
						{forPlayPretend("Indie Soul Fest")}
					</span>
					<span className={styles.edition} aria-label="1 edición">
						{forPlayPretend("1 edición")}
					</span>
				</Link>
			</div>
		</header>
	);
}
