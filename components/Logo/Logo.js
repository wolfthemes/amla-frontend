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
  { label: 'A', viewBox: '35 148 110 125', paths: ['M78,148 L102,148 L145,273 L121,273 Z'] },
  {
    label: 'M',
    viewBox: '217 148 131 125',
    paths: [
      'M217,148 L244,148 L298,222 L285,241 Z',
      'M325,148 L348,148 L348,273 L325,273 Z',
    ],
  },
  {
    label: 'L',
    viewBox: '434 148 77 125',
    paths: [
      'M434,148 L457,148 L457,273 L434,273 Z',
      'M489,253 L511,253 L511,273 L489,273 Z',
    ],
  },
  { label: 'A', viewBox: '582 148 68 125', paths: ['M582,148 L607,148 L650,273 L625,273 Z'] },
];

// First A's viewBox extends 43 units left of its stroke: the mirrored (invisible)
// left leg's footprint, so the slogan aligns with where the A visually starts.
// Each letter is its own <svg> (viewBox = that glyph's bounding box) so a flex
// row can space them out: the wordmark stretches to the width of whatever
// sits beside it (the header slogan) via `justify-content: space-between`.
export function Logo({ title = 'AMLA', className, ...props }) {
  return (
    <span className={className} role="img" aria-label={title} {...props}>
      {LOGO_LETTERS.map((letter, i) => (
        <svg key={i} viewBox={letter.viewBox} fill="currentColor" aria-hidden="true">
          {letter.paths.map((d, j) => (
            <path key={j} d={d} />
          ))}
        </svg>
      ))}
    </span>
  );
}
