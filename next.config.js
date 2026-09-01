const { withFaust, getWpHostname } = require('@faustwp/core');
const { createSecureHeaders } = require('next-secure-headers');
const path = require('node:path');

const wordpressUrl = new URL(process.env.NEXT_PUBLIC_WORDPRESS_URL);

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	reactStrictMode: true,
	// isomorphic-dompurify (used by SafeHtml, for all WP-content pages) pulls
	// in jsdom, which requires several of its own files at runtime via
	// dynamic (non-static) require() calls. Vercel's build-time file tracer
	// only follows static requires, so those files get silently dropped from
	// the serverless function bundle — the page works in `next build && next
	// start` locally (real node_modules on disk) but 500s on Vercel with no
	// useful client-side error. Force-include jsdom's files for every route
	// so the trace has them. ponytail: known Vercel+jsdom class of bug — if a
	// future Next.js file-tracing fix makes this unnecessary, this whole
	// block can go.
	outputFileTracingIncludes: {
		'/**': ['./node_modules/jsdom/**/*'],
	},
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
