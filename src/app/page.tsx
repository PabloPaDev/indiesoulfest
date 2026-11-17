import IndieSoulLanding from "@/components/IndieSoulLanding";
import { BehindTheFestival } from "@/components/landing/behind-the-festival";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingShell } from "@/components/landing/landing-shell";
import { PlayNotesIntegration } from "@/components/landing/playnotes-integration";
import { siteConfig } from "@/config/site";

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Event",
	name: "Indie Soul Fest 2026",
	description: siteConfig.description,
	startDate: siteConfig.dates.start,
	endDate: siteConfig.dates.end,
	eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
	eventStatus: "https://schema.org/EventScheduled",
	url: `https://${siteConfig.publicDomain}`,
	inLanguage: "es",
	organizer: [
		{
			"@type": "Organization",
			name: "PlayNotes",
			url: siteConfig.playnotesUrl,
		},
		{
			"@type": "Organization",
			name: "CarlosEdit.tv",
		},
	],
	location: {
		"@type": "VirtualLocation",
		url: siteConfig.playnotesUrl,
	},
};

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<LandingShell
				hero={<IndieSoulLanding />}
				behind={<BehindTheFestival />}
				after={<PlayNotesIntegration />}
				footer={<LandingFooter />}
			/>
		</>
	);
}
