# Front Page Redesign — Hero + 2 Sections

## Context

`wp-templates/front-page.js` currently renders the Faust/Next.js boilerplate
placeholder content. This spec redesigns it into a 3-part editorial layout
inspired by kononenkogroup.com: a full-bleed animated hero, a scroll-revealed
text section, and a second full-bleed image section.

The stack already has `lenis` (smooth scroll) and `motion` installed, plus two
reusable pieces built for the portfolio page:
- `components/ParallaxImage` — scroll-linked vertical parallax on a
  `FeaturedImage`, clipped by an `overflow: hidden` ancestor.
- The `reveal` animation object in `wp-templates/page-portfolio.js` — a
  fade + slide-up `whileInView` config used for scroll reveals.

This work extends both patterns rather than introducing new ones.

## Scope

Three sections, hero → section 1 (text) → section 2 (image). No "section 3"
— the user's original numbering was renumbered to a clean 1/2 during
brainstorming.

Out of scope: making the section content editable via WordPress/ACF (content
is hardcoded placeholder for now, see "Content" below), site-wide header
overlay behavior (only the front page gets the transparent header), and any
changes to the portfolio page itself.

## Data

`front-page.js`'s GraphQL query is extended to also fetch `works` (reusing
`FeaturedImage.fragments.entry`, the same fragment already used on the
portfolio page):

```graphql
works {
  nodes {
    id
    title
    uri
    ...FeaturedImageFragment
  }
}
```

The first work in the list provides the hero image; the second provides the
section 2 image. If fewer than 2 works exist, the affected section's image
area is skipped (renders nothing) rather than erroring — mirrors the
`featuredWork &&` guard pattern already used in `page-portfolio.js`.

Incidental fix: the current `front-page.js` destructures
`data?.generalSettings` without a `?? {}` fallback, which throws during the
initial render before data loads. This will be corrected to match the
`?? {}` guard already used in `page-portfolio.js`, since the hero heading
depends on `siteTitle` being safely undefined rather than crashing.

## Content

Hardcoded directly in `front-page.js` for now (per user decision — no new
ACF fields this round):
- Hero heading: the site title (`data.generalSettings.title`), same dynamic
  value already used elsewhere (e.g. portfolio hero fallback).
- Section 1 heading: placeholder line array, e.g.
  `['Systematic Clarity', '& Creativity']` — each entry is one visual line.
- Section 1 body: two short placeholder paragraphs (side by side on desktop).

All placeholder strings are plain JS values in the component, trivially
editable later — no i18n or CMS wiring implied.

## A. Header — transparent overlay variant

`components/Header` gains a `transparent` boolean prop (default `false`,
no behavior change for existing callers):

- `transparent === true`: header renders with `position: absolute; top: 0;
  left: 0; right: 0; background: transparent;` and white
  text/logo/nav-link color, so it floats over the hero image instead of
  pushing content down.
- `transparent === false` (default): current opaque, in-flow header,
  completely unchanged.

Only `front-page.js` passes `transparent`. Every other template keeps
`<Header />` as-is.

Implementation: a `transparent` modifier class in `Header.module.scss`
(`cx(['component', transparent && 'transparent'])`), not a separate
component — the markup is identical, only positioning/color changes.

## B. Hero

A new `components/Hero` variant — since the existing `Hero` component
(a generic title/children wrapper used for simple page headers) doesn't fit
a full-bleed animated hero, this is a distinct usage added directly in
`front-page.js` (not a shared component yet — nothing else needs it; can be
extracted if a third page wants the same hero later).

Structure:
- Outer `div`, `height: 100dvh; position: relative; overflow: hidden;`.
- `ParallaxImage` filling it (hero work's featured image), `priority` set
  (LCP element).
- On mount, the image's own wrapper animates `scale: 1.15 → 1` over `1.2s`
  ease-out, layered on top of (not replacing) `ParallaxImage`'s existing
  scroll-parallax transform — achieved with a `motion.div` wrapper around
  `ParallaxImage` carrying the scale animation, since `ParallaxImage`
  itself only exposes the scroll-driven `y` transform.
- Heading: `position: absolute; bottom; left;` inside the hero, white text,
  using `--wpe--font-size--hero`. Animates in with `initial={{opacity:0,
  y:24}} animate={{opacity:1, y:0}}`, `delay: 0.3s` (starts slightly after
  the image scale animation begins).
- Replays every time the page mounts/is navigated to — no session storage
  flag, no "seen once" logic. Simplest option and matches the reference
  site's behavior.
- Respects `prefers-reduced-motion` the same way the rest of the site's
  Motion usage does, via the global `MotionConfig reducedMotion="user"`
  already set in `pages/_app.js` — no extra handling needed here.

## C. Section 1 — line-by-line reveal heading + two text blocks

- Centered heading, placeholder line array rendered as one `motion.span`
  (block-level) per line.
- Reveal: `whileInView`, `viewport={{ once: true }}`, each line's `initial`/
  `animate` matches the existing `reveal` shape (fade + slide-up), with a
  per-line stagger via `transition={{ delay: i * 0.1 }}`.
- Two paragraph blocks below the heading, side-by-side on desktop
  (flex, wraps to stacked under the existing `$breakpoint-small` convention
  used elsewhere in the codebase), stacked on mobile. Both reveal together
  as one block using the existing `reveal` object as-is (no per-block
  stagger — only the heading lines stagger).

## D. Section 2 — big parallax image

Full-bleed `ParallaxImage` (second work's featured image), same component,
no new code beyond a scss block sizing the container (full-bleed width,
tall aspect ratio or fixed viewport-relative height — implementation detail
left to the build step, consistent with how `.hero-image`/`.grid-item-image`
set sizing in `page-portfolio.module.scss`).

## Non-goals / explicitly deferred

- No new npm dependencies.
- No ACF/GraphQL content editing for this round's copy.
- No site-wide transparent-header behavior.
- No "seen once" gating on the hero entrance animation.
- No word-by-word text splitting (line-by-line only, decided during
  brainstorming).
