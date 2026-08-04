/**
 * AMLA wordmark, vectorized from the source logo.
 *
 * The four letters share one coordinate space (viewBox `LOGO_VIEWBOX`), so the
 * static mark and the per-letter hero animation stay pixel-identical — the
 * animation just wraps each letter's paths in its own <g>. Fill is
 * `currentColor`, so the mark takes the surrounding text color (dark on light
 * headers, light on the dark hero, etc.).
 */

// Tight bounding box around the glyphs (x 78..650, y 148..273 in source px).
export const LOGO_VIEWBOX = '78 148 572 125';

// One entry per letter, in reading order. `paths` is the list of filled
// sub-shapes that make up the glyph.
export const LOGO_LETTERS = [
  { label: 'A', paths: ['M78,148 L102,148 L145,273 L121,273 Z'] },
  {
    label: 'M',
    paths: [
      'M217,148 L244,148 L298,222 L285,241 Z',
      'M325,148 L348,148 L348,273 L325,273 Z',
    ],
  },
  {
    label: 'L',
    paths: [
      'M434,148 L457,148 L457,273 L434,273 Z',
      'M489,253 L511,253 L511,273 L489,273 Z',
    ],
  },
  { label: 'A', paths: ['M582,148 L607,148 L650,273 L625,273 Z'] },
];

export function Logo({ title = 'AMLA', className, ...props }) {
  return (
    <svg
      className={className}
      viewBox={LOGO_VIEWBOX}
      fill="currentColor"
      role="img"
      aria-label={title}
      {...props}
    >
      {LOGO_LETTERS.flatMap((letter, i) =>
        letter.paths.map((d, j) => <path key={`${i}-${j}`} d={d} />)
      )}
    </svg>
  );
}
