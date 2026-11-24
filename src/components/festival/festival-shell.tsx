"use client";

import type { ReactNode } from "react";

/**
 * Contenedor del catálogo editorial.
 * Sin sesión / deseados / listas en esta fase (solo fichas locales).
 */
export function FestivalShell({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
