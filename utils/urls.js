export function getSafeHttpUrl(value) {
	if (!value) return null;

	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

export function getSafeEmbedUrl(value) {
	const safeUrl = getSafeHttpUrl(value);
	if (!safeUrl) return null;

	const url = new URL(safeUrl);
	const hostname = url.hostname.replace(/^www\./, '');
	const allowedHosts = new Set([
		'youtube.com',
		'youtube-nocookie.com',
		'youtu.be',
		'vimeo.com',
		'player.vimeo.com',
	]);

	return allowedHosts.has(hostname) ? safeUrl : null;
}
