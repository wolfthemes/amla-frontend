const { withFaust, getWpHostname } = require('@faustwp/core');
const { createSecureHeaders } = require('next-secure-headers');
const path = require('node:path');

const wordpressUrl = new URL(process.env.NEXT_PUBLIC_WORDPRESS_URL);

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	reactStrictMode: true,
	// geist ships pre-built files that call next/font/local internally; Next's
	// font webpack transform skips node_modules unless told to process it here.
	transpilePackages: ['geist'],
	// ponytail: inotify doesn't reliably fire for edits on WSL2's /mnt/c
	// Windows-mounted filesystem, so webpack's dev-mode file watcher misses
	// changes without polling. Only affects local dev on this filesystem.
	webpack: (config, { dev }) => {
		config.resolve.alias.styles = path.join(__dirname, 'styles');
		if (dev) {
			config.watchOptions = { poll: 800, aggregateTimeout: 300 };
		}
		return config;
	},
	sassOptions: {
		includePaths: [__dirname, path.join(__dirname, 'node_modules')],
	},
	images: {
		remotePatterns: [
			{
				protocol: wordpressUrl.protocol.replace(':', ''),
				hostname: getWpHostname(),
				port: wordpressUrl.port,
				pathname: '/wp-content/uploads/**',
			},
		],
	},
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: createSecureHeaders({
					contentSecurityPolicy: {
						directives: {
							defaultSrc: ["'self'"],
							baseURI: ["'self'"],
							connectSrc: ["'self'", wordpressUrl.origin],
							fontSrc: ["'self'", 'data:'],
							formAction: ["'self'", wordpressUrl.origin],
							frameAncestors: ["'none'"],
							frameSrc: [
								"'self'",
								'https://www.youtube.com',
								'https://www.youtube-nocookie.com',
								'https://player.vimeo.com',
							],
							imgSrc: ["'self'", 'data:', 'blob:', wordpressUrl.origin],
							mediaSrc: ["'self'", wordpressUrl.origin],
							objectSrc: ["'none'"],
							scriptSrc: [
								"'self'",
								"'unsafe-inline'",
								...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
							],
							styleSrc: ["'self'", "'unsafe-inline'"],
						},
					},
					referrerPolicy: 'strict-origin-when-cross-origin',
					xssProtection: false,
				}),
			},
		];
	},
});
