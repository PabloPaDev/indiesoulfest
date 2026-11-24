"use client";

import { playnotesLexend } from "@/lib/fonts";
import { useFestivalList } from "./festival-list-context";
import styles from "./festival-list-widget.module.css";

export function FestivalListWidget() {
	const {
		open,
		setOpen,
		toggleOpen,
		gameIds,
		totalAvailable,
		gamesInList,
		remove,
		openGame,
		toast,
		syncMessage,
		syncBusy,
		listName,
		saveToPlaynotes,
	} = useFestivalList();

	const count = gameIds.length;

	return (
		<div className={`${styles.root} ${playnotesLexend.variable} ${playnotesLexend.className}`}>
			{toast && !open ? (
				<div className={styles.toast} role="status">
					{toast.message}
				</div>
			) : null}

			{open ? (
				<section
					className={styles.panel}
					aria-label="Mi lista del festival — PlayNotes"
				>
					<header className={styles.panelHeader}>
						<img
							className={styles.brandMark}
							src="/playnotes/icon-192.png"
							alt=""
							width={48}
							height={48}
						/>
						<div className={styles.brandCopy}>
							<p className={styles.brandName}>PlayNotes</p>
							<h2 className={styles.brandTitle}>Mi lista del festival</h2>
						</div>
						<button
							type="button"
							className={styles.closeBtn}
							aria-label="Cerrar Mi lista del festival"
							onClick={() => setOpen(false)}
						>
							×
						</button>
					</header>

					<p className={styles.summary}>
						<strong>{count}</strong> de {totalAvailable} juegos del festival
					</p>

					{gamesInList.length === 0 ? (
						<div className={styles.empty}>
							<p className={styles.emptyTitle}>Tu lista está vacía</p>
							<p className={styles.emptyText}>
								Todavía no has elegido ningún juego. ¡Explora el festival!
							</p>
						</div>
					) : (
						<ul className={styles.list}>
							{gamesInList.map((game) => (
								<li key={game.id} className={styles.item}>
									{game.coverImage ? (
										<img
											className={styles.thumb}
											src={game.coverImage}
											alt=""
											width={64}
											height={64}
											loading="lazy"
											decoding="async"
										/>
									) : (
										<div className={styles.thumb} aria-hidden />
									)}
									<div className={styles.itemBody}>
										<p className={styles.itemTitle}>
											{game.title ?? "Sin título"}
										</p>
										<p className={styles.itemStudio}>
											{game.studio ?? "Estudio por confirmar"}
										</p>
									</div>
									<div className={styles.itemActions}>
										<button
											type="button"
											className={styles.itemBtn}
											onClick={() => {
												openGame(game.id);
												setOpen(false);
											}}
										>
											Ver ficha
										</button>
										<button
											type="button"
											className={styles.itemDanger}
											onClick={() => remove(game.id)}
										>
											Quitar
										</button>
									</div>
								</li>
							))}
						</ul>
					)}

					<footer className={styles.footer}>
						<button
							type="button"
							className={styles.primary}
							disabled={syncBusy || count === 0}
							onClick={() => void saveToPlaynotes()}
						>
							{syncBusy
								? "Conectando con PlayNotes…"
								: `Guardar «${listName}»`}
						</button>
						<p className={styles.status}>
							{syncMessage ??
								"Selección temporal en este navegador. Aún no está guardada en tu cuenta de PlayNotes."}
						</p>
					</footer>
				</section>
			) : null}

			{toast && open ? (
				<div className={`${styles.toast} ${styles.toastWithPanel}`} role="status">
					{toast.message}
				</div>
			) : null}

			<button
				type="button"
				className={`${styles.fab} ${count > 0 ? styles.fabActive : ""}`}
				aria-expanded={open}
				aria-controls={undefined}
				aria-label={
					open
						? "Cerrar Mi lista del festival"
						: `Abrir Mi lista del festival${count ? `, ${count} juegos` : ""}`
				}
				onClick={toggleOpen}
			>
				<img
					className={styles.fabIcon}
					src="/playnotes/icon-192.png"
					alt=""
					width={64}
					height={64}
				/>
				<span className={styles.fabCopy}>
					<span className={styles.fabLabel}>Mi lista</span>
					<span className={styles.fabSub}>
						{count > 0 ? `${count} en PlayNotes` : "PlayNotes"}
					</span>
				</span>
				{count > 0 ? (
					<span className={styles.fabCount} key={count}>
						{count > 99 ? "99+" : count}
					</span>
				) : null}
			</button>
		</div>
	);
}
