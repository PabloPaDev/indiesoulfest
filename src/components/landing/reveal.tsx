import type { ReactNode } from "react";
import styles from "./reveal.module.css";

type RevealProps = {
	children: ReactNode;
	className?: string;
};

/** Aparición suave al entrar en vista. Sin JS; respeta prefers-reduced-motion. */
export function Reveal({ children, className }: RevealProps) {
	return (
		<div className={`${styles.reveal} ${className ?? ""}`.trim()}>
			{children}
		</div>
	);
}
