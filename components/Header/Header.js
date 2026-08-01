import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Past the header's own rendered height, natural scroll has already
// carried it off-screen — safe to switch it to fixed positioning since
// both states are invisible at that point, no visible jump.
const NATURAL_SCROLL_THRESHOLD = 150;
// Past this the header slides back down, now sticky and blended.
const REVEAL_SCROLL_THRESHOLD = 200;

export default function Header({
  title = 'Headless by WP Engine',
  description,
  menuItems,
  // The transparent, sticky, reveal-on-scroll menu is the default on every
  // page. The front page overlays a dark hero so it opts out of `dark`; every
  // other page sits on a light background and keeps the dark-font default.
  transparent = true,
  dark = true
}) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [scrollState, setScrollState] = useState('top'); // 'top' | 'fixed' | 'revealed'

  // The dark variant overlays a light page with no full-bleed hero to sit on,
  // so — unlike the front page — its content would collide with the absolute
  // header. Reserve a matching gap by mirroring the header's rendered height.
  const headerRef = useRef(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.offsetHeight;
      setSpacerHeight(h);
      // Publish the rendered height on every page (not just the dark variant)
      // so in-page content can offset itself below the bar — the dark spacer,
      // the portfolio sticky caption, and the front-page statement's top pad.
      document.documentElement.style.setProperty('--wpe--header--height', `${h}px`);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--wpe--header--height');
    };
  }, []);

  useEffect(() => {
    // Only the front-page variant scrolls away and reveals on scroll. The
    // dark variant is permanently pinned (position: fixed) via CSS, so it has
    // no scroll states to track.
    if (!transparent || dark) return;

    const onScroll = () => {
      const y = window.scrollY;
      setScrollState(
        y >= REVEAL_SCROLL_THRESHOLD ? 'revealed' : y >= NATURAL_SCROLL_THRESHOLD ? 'fixed' : 'top'
      );
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent, dark]);

  return (
    <>
    <header
      ref={headerRef}
      className={cx([
        'component',
        transparent && 'transparent',
        transparent && dark && 'dark',
        transparent && scrollState !== 'top' && 'fixed',
        transparent && scrollState === 'revealed' && 'revealed'
      ])}
    >
      <SkipNavigationLink />
        <Container>
          <div className={cx('navbar')}>
            <div className={cx('brand')}>
              <Link legacyBehavior href="/">
                <a className={cx('title')}>{title}</a>
              </Link>
              {description && <p className={cx('description')}>{description}</p>}
            </div>
            <button
              type="button"
              className={cx('nav-toggle')}
              onClick={() => setIsNavShown(!isNavShown)}
              aria-label="Basculer la navigation"
              aria-controls={cx('primary-navigation')}
              aria-expanded={isNavShown}
            >
              ☰
            </button>
            <NavigationMenu
              className={cx(['primary-navigation', isNavShown ? 'show' : undefined])}
              menuItems={menuItems}
            />
        </div>
      </Container>
    </header>
    {transparent && dark && (
      <div aria-hidden="true" style={{ height: spacerHeight }} />
    )}
    </>
  );
}
