import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Below this, the hero header's plain white text already reads fine over
// the hero image — mix-blend-mode only earns its keep once scroll starts
// passing lighter content underneath.
const BLEND_SCROLL_THRESHOLD = 50;

// mix-blend-mode can't be transitioned (it isn't an animatable property),
// so the flip is masked with a quick opacity fade instead. Keep in sync
// with the .fading transition duration in Header.module.scss.
const BLEND_FADE_MS = 200;

export default function Header({
  title = 'Headless by WP Engine',
  description,
  menuItems,
  transparent = false
}) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!transparent) return;

    let fadeTimeout;
    const onScroll = () => {
      const shouldBlend = window.scrollY > BLEND_SCROLL_THRESHOLD;
      setIsScrolled((wasBlended) => {
        if (wasBlended === shouldBlend) return wasBlended;
        setIsFading(true);
        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => setIsFading(false), BLEND_FADE_MS);
        return shouldBlend;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(fadeTimeout);
    };
  }, [transparent]);

  return (
    <header
      className={cx([
        'component',
        transparent && 'transparent',
        isScrolled && 'scrolled',
        isFading && 'fading'
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
  );
}
