"use client";

import { playnotesLexend } from "@/lib/fonts";
import { useOptionalFestivalList } from "./festival-list-context";
import styles from "./add-to-festival-list-button.module.css";

type AddToFestivalListButtonProps = {
	gameId: string;
	/** Variante para fondos oscuros (explorador). */
	tone?: "default" | "onDark";
	/** Etiqueta corta para fichas estrechas (p. ej. catálogo móvil). */
	compact?: boolean;
	/** Texto personalizado (p. ej. ficha del juego). */
	label?: string;
	activeLabel?: string;
	className?: string;
};

export function AddToFestivalListButton({
	gameId,
	tone = "default",
	compact = false,
	label: labelProp,
	activeLabel,
	className,
}: AddToFestivalListButtonProps) {
	const list = useOptionalFestivalList();
	if (!list) return null;

	const active = list.has(gameId);
	const label = active
		? (activeLabel ??
			(compact ? "✓ Lista" : "✓ En mi lista"))
		: (labelProp ??
			(compact ? "+ Lista" : "+ Añadir a mi lista"));

	return (
		<button
			type="button"
			className={[
				styles.btn,
				compact ? styles.compact : "",
				playnotesLexend.variable,
				playnotesLexend.className,
				active ? styles.onList : "",
				tone === "onDark" ? styles.ghostOnDark : "",
				className ?? "",
			]
				.filter(Boolean)
				.join(" ")}
			aria-pressed={active}
			aria-label={active ? "Quitar de mi lista" : "Añadir a mi lista"}
			onClick={() => list.toggle(gameId)}
		>
			{label}
		</button>
	);
}
