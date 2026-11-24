/** @type {import("next").NextConfig} */
const nextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "shared.akamai.steamstatic.com",
				pathname: "/store_item_assets/**",
			},
			{
				protocol: "https",
				hostname: "cdn.cloudflare.steamstatic.com",
				pathname: "/steam/apps/**",
			},
			{
				protocol: "https",
				hostname: "cdn.akamai.steamstatic.com",
				pathname: "/steam/apps/**",
			},
			{
				protocol: "https",
				hostname: "img.itch.zone",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "visualnoveluniverse.com",
				pathname: "/**",
			},
		],
	},
	turbopack: {
		rules: {
			"*.css": {
				condition: {
					not: { path: "*.module.css" },
				},
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;
