import { getWordPressProps, WordPressTemplate } from '@faustwp/core';

export default function Page(props) {
  return <WordPressTemplate {...props} />;
}

// ISR: Next.js regenerates the page in the background at most every
// REVALIDATE_SECONDS, but only swaps it in if regeneration succeeds — if
// WordPress is down/unreachable, getWordPressProps throws and Next just
// keeps serving the last good version (built-in ISR behavior, no extra code
// needed). Set NEXT_PUBLIC_REVALIDATE_SECONDS=0 to fall back to on-demand
// (webhook-only) revalidation.
const REVALIDATE_SECONDS = Number(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS ?? 120);

export function getStaticProps(ctx) {
  return getWordPressProps({
    ctx,
    revalidate: REVALIDATE_SECONDS || false,
  });
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
