import '../faust.config';
import React from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { MotionConfig } from 'motion/react';
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
          <Component {...pageProps} key={router.asPath} />
        </FaustProvider>
      </MotionConfig>
    </div>
  );
}
