import Link from "next/link";
import { forPlayPretend } from "@/lib/display-text";

export function FestivalHeader({ reserveList = false }: { reserveList?: boolean }) {
	return (
		<header className="sticky top-0 z-30 border-b-4 border-ink bg-[#f5f0e5] text-ink">
			<div className={`mx-auto flex w-full min-w-0 max-w-[1200px] items-center py-3 pl-4 sm:px-6 ${reserveList ? "pr-16" : "pr-4"}`}>
				<Link href="/" className="flex min-w-0 max-w-full flex-col">
					<span
						className="font-display text-[clamp(1.15rem,6vw,2rem)] leading-[0.85] uppercase"
						aria-label="Indie Soul Fest"
					>
						{forPlayPretend("Indie Soul Fest")}
					</span>
					<span
						className="font-display text-[clamp(0.72rem,3.2vw,0.95rem)] leading-[0.9] uppercase opacity-90"
						aria-label="1 edición"
					>
						{forPlayPretend("1 edición")}
					</span>
				</Link>
			</div>
		</header>
	);
}
