import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Past this the hero header is considered "at the top" and sits in its
// normal, unblended spot; past it (but before the reveal) it's hidden.
const HIDE_SCROLL_THRESHOLD = 10;
// Past this the header slides back down, now sticky and blended.
const REVEAL_SCROLL_THRESHOLD = 400;

export default function Header({
  title = 'Headless by WP Engine',
  description,
  menuItems,
  transparent = false
}) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [scrollState, setScrollState] = useState('top'); // 'top' | 'hidden' | 'revealed'

  useEffect(() => {
    if (!transparent) return;

    const onScroll = () => {
      const y = window.scrollY;
      setScrollState(
        y >= REVEAL_SCROLL_THRESHOLD ? 'revealed' : y <= HIDE_SCROLL_THRESHOLD ? 'top' : 'hidden'
      );
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  return (
    <header className={cx(['component', transparent && 'transparent', transparent && scrollState])}>
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
