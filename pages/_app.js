import '../faust.config';
import React from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import { GeistSans } from 'geist/font/sans';
import '@faustwp/core/dist/css/toolbar.css';
import '../styles/global.scss';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div className={GeistSans.className}>
      <FaustProvider pageProps={pageProps}>
        <Component {...pageProps} key={router.asPath} />
      </FaustProvider>
    </div>
  );
}
