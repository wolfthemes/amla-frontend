import { useEffect } from 'react';
import Lenis from 'lenis';

// ponytail: one Lenis instance for the whole app; per-section instances aren't needed here.
let activeLenis = null;

// Lets code outside this component (the page-transition wrapper in
// _app.js) reset scroll through Lenis's own API rather than a plain
// window.scrollTo — Lenis virtualizes scroll, so a native scroll doesn't
// update its internal target and the two disagree until Lenis's next
// tick corrects it (the page-load auto-scroll/gap and the client-nav
// sticky-content jump were both this same mismatch).
export function getLenis() {
	return activeLenis;
}

export default function SmoothScroll() {
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const lenis = new Lenis();
		activeLenis = lenis;

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		const frame = requestAnimationFrame(raf);

		return () => {
			cancelAnimationFrame(frame);
			lenis.destroy();
			activeLenis = null;
		};
	}, []);

	return null;
}
