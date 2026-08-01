import classNames from 'classnames/bind';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './NavigationMenu.module.scss';
import stylesFromWP from './NavigationMenuClassesFromWP.module.scss';
import { flatListToHierarchical } from '@faustwp/core';

let cx = classNames.bind(styles);
let cxFromWp = classNames.bind(stylesFromWP);

// Drop a trailing slash so WP's "/portfolio/" style paths compare equal to
// Next's router.asPath, which normally omits it (trailingSlash isn't set).
const withoutTrailingSlash = (path) => path?.replace(/\/$/, '') || '/';

export default function NavigationMenu({ menuItems, className, vertical }) {
  const router = useRouter();

  if (!menuItems) {
    return null;
  }

  // Based on https://www.wpgraphql.com/docs/menus/#hierarchical-data
  const hierarchicalMenuItems = flatListToHierarchical(menuItems);

  function renderMenu(items) {
    // The horizontal header menu reads as a comma-separated text list
    // ("Work, Process, Studio") — every regular item but the last gets a
    // trailing comma; the pill CTA is excluded.
    const lastRegularId = items
      .filter((i) => i.__typename && !i.cssClasses?.includes('button'))
      .at(-1)?.id;

    return (
      <ul className={cx(['menu', vertical && 'vertical'])}>
        {items.map((item) => {
          const { id, path, label, children, cssClasses } = item;

          // @TODO - Remove guard clause after ghost menu items are no longer appended to array.
          if (!item.hasOwnProperty('__typename')) {
            return null;
          }

          const isActive =
            !!path &&
            withoutTrailingSlash(router.asPath) === withoutTrailingSlash(path);

          // The pill CTA (WP "button" menu class) uses the vertical curtain
          // roll instead of the horizontal mask reveal.
          const isButton = cssClasses?.includes('button');

          // Comma after each regular item except the last (not the pill).
          const hasComma = !vertical && !isButton && id !== lastRegularId;

          return (
            <li key={id} className={cxFromWp(cssClasses)}>
              <Link
                href={path ?? ''}
                className={cx({ 'is-active': isActive, 'has-comma': hasComma })}
              >
                {vertical ? (
                  label ?? ''
                ) : (
                  // Mask reveal (header only — see NavigationMenu.module.scss).
                  // Ref: wolfthemes Overable's .link__mask — a two-layer
                  // counter-slide: the clip (.label-mask) moves -100%->0 while
                  // its inner clone moves 100%->0, so the greyed clone is
                  // unmasked left-to-right in place (the text doesn't travel).
                  // Rendered in JSX (SSR-safe) rather than a data-text ::after.
                  <span className={cx('label', { 'is-button': isButton })}>
                    <span className={cx('label-text')}>{label ?? ''}</span>
                    <span aria-hidden="true" className={cx('label-mask')}>
                      <span className={cx('label-mask-inner')}>
                        {label ?? ''}
                      </span>
                    </span>
                  </span>
                )}
              </Link>
              {children.length ? renderMenu(children) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <nav
      className={cx(['component', className])}
      role="navigation"
      aria-label={`${menuItems[0]?.menu?.node?.name} menu`}>
      {renderMenu(hierarchicalMenuItems)}
    </nav>
  );
}

NavigationMenu.fragments = {
  entry: gql`
    fragment NavigationMenuItemFragment on MenuItem {
      id
      path
      label
      parentId
      cssClasses
      menu {
        node {
          name
        }
      }
    }
  `,
};
