import { useState, useEffect } from 'react';
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
const REVEAL_SCROLL_THRESHOLD = 400;

export default function Header({
  title = 'Headless by WP Engine',
  description,
  menuItems,
  transparent = false
}) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [scrollState, setScrollState] = useState('top'); // 'top' | 'fixed' | 'revealed'

  useEffect(() => {
    if (!transparent) return;

    const onScroll = () => {
      const y = window.scrollY;
      setScrollState(
        y >= REVEAL_SCROLL_THRESHOLD ? 'revealed' : y >= NATURAL_SCROLL_THRESHOLD ? 'fixed' : 'top'
      );
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  return (
    <header
      className={cx([
        'component',
        transparent && 'transparent',
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
  );
}
