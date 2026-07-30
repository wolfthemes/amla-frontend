import '../faust.config';
import React from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import localFont from 'next/font/local';
import { MotionConfig } from 'motion/react';
import { SmoothScroll } from '../components';
import '@faustwp/core/dist/css/toolbar.css';
import '../styles/global.scss';

// Replaces Geist as the site's font. "Book" is Maison Neue's regular
// weight. Mono isn't applied anywhere by default — its variable is just
// available (var(--font-maison-neue-mono)) if a component wants it later.
const maisonNeue = localFont({
  src: [
    { path: '../fonts/fonnts.com-Maison_Neue_Light.ttf', weight: '300', style: 'normal' },
    { path: '../fonts/fonnts.com-Maison_Neue_Book.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/fonnts.com-Maison_Neue_Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-maison-neue',
});

const maisonNeueMono = localFont({
  src: '../fonts/fonnts.com-Maison_Neue_Mono.ttf',
  variable: '--font-maison-neue-mono',
});

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div className={`${maisonNeue.className} ${maisonNeueMono.variable}`}>
      <MotionConfig reducedMotion="user">
        <SmoothScroll />
        <FaustProvider pageProps={pageProps}>
          <Component {...pageProps} key={router.asPath} />
        </FaustProvider>
      </MotionConfig>
    </div>
  );
}
