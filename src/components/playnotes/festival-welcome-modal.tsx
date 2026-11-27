"use client";

import { useEffect, useId, useState } from "react";
import {
	hasSeenWelcome,
	markWelcomeSeen,
} from "@/lib/playnotes/festival-list-storage";
import { startPlaynotesConnect } from "@/lib/playnotes/bff-client";
import { forPlayPretend } from "@/lib/display-text";
import styles from "./festival-welcome-modal.module.css";

export function FestivalWelcomeModal() {
	const titleId = useId();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (hasSeenWelcome()) return;
		// Marcar al mostrar para que un remount/HMR no lo vuelva a abrir.
		markWelcomeSeen();
		const timer = window.setTimeout(() => setVisible(true), 480);
		return () => window.clearTimeout(timer);
	}, []);

	const dismiss = () => {
		markWelcomeSeen();
		setVisible(false);
	};

	const connect = () => {
		markWelcomeSeen();
		setVisible(false);
		startPlaynotesConnect();
	};

	if (!visible) return null;

	return (
		<div className={styles.overlay} role="presentation" onClick={dismiss}>
			<div
				className={styles.dialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					className={styles.close}
					aria-label="Cerrar"
					onClick={dismiss}
				>
					×
				</button>
				<p className={styles.eyebrow}>{forPlayPretend("Indie Soul Fest")}</p>
				<h2 id={titleId} className={styles.title}>
					{forPlayPretend("El festival acaba. Tu lista se queda.")}
				</h2>
				<p className={styles.body}>
					Recorre Indie Soul Fest, descubre nuevos videojuegos y crea tu propia
					selección. Si tienes cuenta en PlayNotes, podrás guardar tu lista
					directamente en tu perfil para volver a ella cuando quieras.
				</p>
				<div className={styles.actions}>
					<button type="button" className={styles.primary} onClick={connect}>
						Conectar con PlayNotes
					</button>
					<button type="button" className={styles.secondary} onClick={dismiss}>
						Continuar sin conectar
					</button>
				</div>
			</div>
		</div>
	);
}
