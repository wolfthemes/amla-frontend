import '../faust.config';
import React from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { SmoothScroll } from '../components';
import '@faustwp/core/dist/css/toolbar.css';
import '../styles/global.scss';

// Body font. Mono isn't applied anywhere by default — its variable is just
// available (var(--font-maison-neue-mono)) if a component wants it later.
const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ['latin'],
	weight: ['300', '400', '700'],
	variable: '--font-plus-jakarta-sans',
});

const maisonNeueMono = localFont({
	src: '../fonts/fonnts.com-Maison_Neue_Mono.ttf',
	variable: '--font-maison-neue-mono',
});

// Display face for headings — exposed as a CSS variable (var(--font-nt-seawave))
// and wired to h1–h6 in styles/_base.scss via --wpe--font-family--heading.
const ntSeawave = localFont({
	src: '../fonts/NT-Seawave.woff2',
	// Single Regular file, but declare it as covering 400–700 so headings'
	// font-weight: bold maps onto the real outlines instead of triggering the
	// browser's faux-bold synthesis (which smears NT Seawave's glyphs).
	weight: '400 700',
	variable: '--font-nt-seawave',
});

export default function MyApp({ Component, pageProps }) {
	const router = useRouter();

	return (
		<div
			className={`${plusJakartaSans.className} ${maisonNeueMono.variable} ${ntSeawave.variable}`}
		>
			<MotionConfig reducedMotion="user">
				<SmoothScroll />
				<FaustProvider pageProps={pageProps}>
					{/* popLayout (not wait): the outgoing page is pulled out of flow
              immediately and the incoming one mounts straight away, so
              they briefly overlap — required for the work grid's shared
              layoutId image to actually have both ends present to morph
              between (see WorksShowcase/page-projets' .item-image and
              EntryHeader's mediaLayoutId). Falls back to a plain
              crossfade+drift for any route pair with no matching
              layoutId, same reveal language used everywhere else on the
              site (opacity + y, easeOut).

              No `initial={false}` here — that prop doesn't just skip
              this wrapper's own first-load animation, it suppresses the
              *initial* animation of every motion child mounted on that
              first render, site-wide (e.g. the front page's hero-image
              zoom-out) per AnimatePresence's documented behavior. First
              load plays this wrapper's fade too; harmless, and it's
              what lets nested entrances (hero zoom, title stagger, …)
              keep working on first load, not just on nav.

              Opacity only, no `y` drift: a translateY on this top-level
              wrapper shifts the whole page visually while Lenis
              measures scroll height on mount, so the two would briefly
              disagree — a slight auto-scroll and a leftover gap at the
              bottom once it settled. Individual pages' own entrances
              (hero zoom, title stagger, …) still carry the movement;
              this outer layer doesn't need to. */}
					<AnimatePresence mode="popLayout">
						<motion.div
							key={router.asPath}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4, ease: 'easeOut' }}
						>
							<Component {...pageProps} />
						</motion.div>
					</AnimatePresence>
				</FaustProvider>
			</MotionConfig>
		</div>
	);
}
