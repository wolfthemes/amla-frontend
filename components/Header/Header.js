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

export default function Header({
  title = 'Headless by WP Engine',
  description,
  menuItems,
  transparent = false
}) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;

    const onScroll = () => setIsScrolled(window.scrollY > BLEND_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  return (
    <header className={cx(['component', transparent && 'transparent', isScrolled && 'scrolled'])}>
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
