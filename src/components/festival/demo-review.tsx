"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
	DEMO_COMMENT_MAX_LENGTH,
	type DemoComment,
} from "@/lib/demo-comments";
import {
	createCommentId,
	readLocalReview,
	writeLocalReview,
} from "@/lib/demo-reviews";
import styles from "./demo-review.module.css";

async function loadComments(gameId: string): Promise<DemoComment[]> {
	const response = await fetch(
		`/api/demo-comments?gameId=${encodeURIComponent(gameId)}`,
		{ cache: "no-store" },
	);
	if (!response.ok) return [];
	const data = (await response.json()) as { comments?: DemoComment[] };
	return Array.isArray(data.comments) ? data.comments : [];
}

export function DemoCommentsLink({ gameId }: { gameId: string }) {
	const [open, setOpen] = useState(false);
	const [comments, setComments] = useState<DemoComment[] | null>(null);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		setComments(null);
		loadComments(gameId)
			.then((next) => {
				if (!cancelled) setComments(next);
			})
			.catch(() => {
				if (!cancelled) setComments([]);
			});
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			setOpen(false);
		};
		document.addEventListener("keydown", onKey, true);
		return () => {
			cancelled = true;
			document.removeEventListener("keydown", onKey, true);
		};
	}, [open, gameId]);

	return (
		<>
			<button
				type="button"
				className={styles.commentsLink}
				onClick={() => setOpen(true)}
			>
				ver comentarios
			</button>
			{open
				? createPortal(
						<div
							className={styles.modalBackdrop}
							role="presentation"
							onClick={() => setOpen(false)}
						>
							<div
								className={styles.modal}
								role="dialog"
								aria-modal="true"
								aria-label="Comentarios"
								onClick={(event) => event.stopPropagation()}
							>
								<div className={styles.modalHead}>
									<p className={styles.label}>Comentarios</p>
									<button
										type="button"
										className={styles.modalClose}
										onClick={() => setOpen(false)}
										aria-label="Cerrar comentarios"
									>
										×
									</button>
								</div>
								{comments == null ? (
									<p className={styles.empty}>Cargando…</p>
								) : comments.length === 0 ? (
									<p className={styles.empty}>Todavía no hay comentarios.</p>
								) : (
									<ul className={styles.list}>
										{comments.map((comment) => (
											<li key={comment.id} className={styles.text}>
												{comment.text}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}

export function DemoReview({ gameId }: { gameId: string }) {
	const [text, setText] = useState("");
	const [saved, setSaved] = useState<string | null>(null);
	const [editing, setEditing] = useState(false);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	useEffect(() => {
		const current = readLocalReview(gameId);
		setSaved(current?.text ?? null);
		setText(current?.text ?? "");
		setEditing(!current);
		setReady(true);
	}, [gameId]);

	if (!ready) return null;

	const save = async () => {
		const next = text.trim();
		if (!next || pending) return;
		const current = readLocalReview(gameId);
		const id = current?.id ?? createCommentId();
		setPending(true);
		setError("");
		try {
			const response = await fetch("/api/demo-comments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, gameId, text: next }),
			});
			if (!response.ok) {
				setError("No se ha podido publicar el comentario.");
				return;
			}
			writeLocalReview(gameId, { id, text: next });
			setSaved(next);
			setText(next);
			setEditing(false);
		} catch {
			setError("No se ha podido publicar el comentario.");
		} finally {
			setPending(false);
		}
	};

	const remove = async () => {
		const current = readLocalReview(gameId);
		setPending(true);
		setError("");
		try {
			if (current) {
				await fetch("/api/demo-comments", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id: current.id, gameId }),
				});
			}
			writeLocalReview(gameId, null);
			setSaved(null);
			setText("");
			setEditing(true);
		} finally {
			setPending(false);
		}
	};

	return (
		<section className={styles.root} aria-label="Reseña de la demo">
			<p className={styles.label}>Reseña de la demo</p>
			{saved && !editing ? (
				<>
					<p className={styles.text}>{saved}</p>
					<div className={styles.row}>
						<button
							type="button"
							className={styles.ghost}
							onClick={() => setEditing(true)}
							disabled={pending}
						>
							Editar
						</button>
						<button
							type="button"
							className={styles.ghost}
							onClick={() => void remove()}
							disabled={pending}
						>
							Borrar
						</button>
					</div>
				</>
			) : (
				<form
					className={styles.form}
					onSubmit={(event) => {
						event.preventDefault();
						void save();
					}}
				>
					<textarea
						className={styles.field}
						value={text}
						maxLength={DEMO_COMMENT_MAX_LENGTH}
						rows={3}
						placeholder="Ayuda a los devs, ¿qué te ha parecido?"
						aria-label="Ayuda a los devs, ¿qué te ha parecido?"
						onChange={(event) => setText(event.target.value)}
					/>
					<div className={styles.row}>
						<button
							type="submit"
							className={styles.save}
							disabled={pending || !text.trim()}
						>
							Guardar
						</button>
						{saved ? (
							<button
								type="button"
								className={styles.ghost}
								onClick={() => {
									setText(saved);
									setEditing(false);
									setError("");
								}}
							>
								Cancelar
							</button>
						) : null}
					</div>
				</form>
			)}
			{error ? <p className={styles.error}>{error}</p> : null}
		</section>
	);
}
