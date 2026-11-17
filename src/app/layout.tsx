import type { Metadata } from "next";
import { TransitionProvider } from "@/components/transition/transition-provider";
import { siteConfig } from "@/config/site";
import { bankGothic, pixelDigivolve, playPretend } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(`https://${siteConfig.publicDomain}`),
	title: {
		default: "Indie Soul Fest 2026",
		template: "%s · Indie Soul Fest 2026",
	},
	description: siteConfig.description,
	applicationName: siteConfig.name,
	keywords: [
		"Indie Soul Fest",
		"videojuegos independientes",
		"festival digital",
		"demos",
		"PlayNotes",
		"CarlosEdit.tv",
	],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "es_ES",
		url: `https://${siteConfig.publicDomain}`,
		siteName: siteConfig.name,
		title: "Indie Soul Fest 2026",
		description: siteConfig.description,
		images: [
			{
				url: "/og-cartel.png",
				width: 724,
				height: 1024,
				alt: "Cartel oficial de Indie Soul Fest",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Indie Soul Fest 2026",
		description: siteConfig.description,
		images: ["/og-cartel.png"],
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="es"
			className={`${playPretend.variable} ${bankGothic.variable} ${pixelDigivolve.variable} h-full antialiased`}
		>
			<body className="min-h-full">
				<TransitionProvider>{children}</TransitionProvider>
			</body>
		</html>
	);
}
