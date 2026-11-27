"use client";

import { playnotesLexend } from "@/lib/fonts";
import { siteConfig } from "@/config/site";
import { useFestivalList } from "./festival-list-context";
import styles from "./festival-list-widget.module.css";

type FestivalListWidgetProps = {
	/**
	 * overlay: flotante (legado).
	 * inline: en la barra del catálogo.
	 * toolbar: debajo de Explorador/Catálogo, solo logo + contador.
	 */
	placement?: "overlay" | "inline" | "toolbar";
};

export function FestivalListWidget({ placement = "overlay" }: FestivalListWidgetProps) {
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
		syncStatus,
		syncStatusLabel,
		listName,
		authenticated,
		user,
		connectToPlaynotes,
		disconnectPlaynotes,
		listUrl,
	} = useFestivalList();

	const count = gameIds.length;
	const rootClass =
		placement === "inline"
			? styles.rootInline
			: placement === "toolbar"
				? styles.rootToolbar
				: "";

	return (
		<div className={`${styles.root}${rootClass ? ` ${rootClass}` : ""} ${playnotesLexend.variable} ${playnotesLexend.className}`}>
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
						<p
							className={`${styles.status}${
								syncStatus === "pending" || syncStatus === "offline"
									? ` ${styles.statusPending}`
									: ""
							}`}
							role="status"
						>
							{syncStatusLabel}
						</p>

						{authenticated ? (
							<div className={styles.accountRow}>
								<div className={styles.accountCopy}>
									<p className={styles.accountUser}>
										{user?.username ? `@${user.username}` : "Cuenta PlayNotes"}
									</p>
									{listUrl ? (
										<a
											className={styles.accountLink}
											href={listUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											Abrir en PlayNotes
										</a>
									) : null}
								</div>
								<button
									type="button"
									className={styles.ghost}
									onClick={() => void disconnectPlaynotes()}
								>
									Desconectar
								</button>
							</div>
						) : (
							<button
								type="button"
								className={styles.linkish}
								onClick={connectToPlaynotes}
							>
								Vincular cuenta de PlayNotes
							</button>
						)}

						<p className={styles.listHint}>
							Lista «{listName}» · {siteConfig.playnotesUrl.replace(/^https?:\/\//, "")}
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
						{authenticated
							? count > 0
								? `${count} sincronizados`
								: "PlayNotes"
							: count > 0
								? `${count} en este dispositivo`
								: "PlayNotes"}
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
