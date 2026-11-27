"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { festivalOpeningLabel } from "@/lib/festival-opening";
import { forPlayPretend } from "@/lib/display-text";
import {
	clearPlaynotesConnectLock,
	fetchPlaynotesSession,
	startPlaynotesConnect,
} from "@/lib/playnotes/bff-client";
import styles from "./festival-not-open.module.css";

type LinkState = "checking" | "linked" | "ready";

export type PlaynotesReturnStatus = "connected" | "error";

function noticeFor(status: PlaynotesReturnStatus | null): string | null {
	if (status === "connected") return "Cuenta de PlayNotes vinculada.";
	if (status === "error") return "No se pudo vincular la cuenta. Puedes intentarlo de nuevo.";
	return null;
}

function usePlaynotesLinkState(returnStatus: PlaynotesReturnStatus | null) {
	const [linkState, setLinkState] = useState<LinkState>(
		returnStatus === "connected" ? "linked" : "checking",
	);

	useEffect(() => {
		clearPlaynotesConnectLock();
		if (returnStatus) {
			const url = new URL(window.location.href);
			url.searchParams.delete("playnotes");
			url.searchParams.delete("import");
			url.searchParams.delete("reason");
			const query = url.searchParams.toString();
			window.history.replaceState({}, "", query ? `${url.pathname}?${query}` : url.pathname);
		}

		let cancelled = false;
		fetchPlaynotesSession().then((session) => {
			if (cancelled) return;
			setLinkState(session.authenticated || returnStatus === "connected" ? "linked" : "ready");
		});
		return () => {
			cancelled = true;
		};
	}, [returnStatus]);

	return { linkState, notice: noticeFor(returnStatus) };
}

function FestivalNotOpenCopy({
	linkState,
	notice,
	onClose,
}: {
	linkState: LinkState;
	notice: string | null;
	onClose?: () => void;
}) {
	const titleId = useId();

	return (
		<div
			className={styles.dialog}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			onClick={(event) => event.stopPropagation()}
		>
			{onClose ? (
				<button
					type="button"
					className={styles.close}
					aria-label="Cerrar"
					onClick={onClose}
				>
					×
				</button>
			) : null}
			<p className={styles.eyebrow}>{forPlayPretend("Indie Soul Fest")}</p>
			<p id={titleId} className={styles.body}>
				Aún no se puede entrar al festival, pero si tienes cuenta en PlayNotes la puedes vincular.
			</p>
			<p className={styles.when}>
				El {festivalOpeningLabel()} ya se podrá entrar.
			</p>
			{notice ? <p className={styles.notice}>{notice}</p> : null}
			<div className={styles.actions}>
				{linkState === "linked" ? (
					<p className={styles.linked}>Tu cuenta de PlayNotes ya está vinculada.</p>
				) : (
					<button
						type="button"
						className={styles.primary}
						onClick={startPlaynotesConnect}
						disabled={linkState === "checking"}
						aria-busy={linkState === "checking"}
					>
						Vincular cuenta
					</button>
				)}
				{onClose ? (
					<button type="button" className={styles.secondary} onClick={onClose}>
						Cerrar
					</button>
				) : (
					<Link href="/" className={styles.secondary}>
						Volver a la portada
					</Link>
				)}
			</div>
		</div>
	);
}

/** Aviso de la portada: el botón de entrar aún no abre el festival. */
export function FestivalNotOpenDialog({ onClose }: { onClose: () => void }) {
	const { linkState, notice } = usePlaynotesLinkState(null);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = previousOverflow;
		};
	}, [onClose]);

	return (
		<div className={styles.overlay} role="presentation" onClick={onClose}>
			<FestivalNotOpenCopy
				linkState={linkState}
				notice={notice}
				onClose={onClose}
			/>
		</div>
	);
}

/** Quien entre por la dirección del festival antes de tiempo ve el mismo aviso. */
export function FestivalNotOpenScreen({
	returnStatus = null,
}: {
	returnStatus?: PlaynotesReturnStatus | null;
}) {
	const { linkState, notice } = usePlaynotesLinkState(returnStatus);

	return (
		<div className={`isf-grid ${styles.screen}`}>
			<FestivalNotOpenCopy linkState={linkState} notice={notice} />
		</div>
	);
}
