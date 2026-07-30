import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
  Header,
  Footer,
  Main,
  Heading,
  FeaturedImage,
  ParallaxImage,
  NavigationMenu,
  SEO,
} from '../components';
import styles from './page-portfolio.module.scss';

let cx = classNames.bind(styles);

// ponytail: shared once here; promote to a component if a third page needs the same reveal.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default function Component() {
  const { data } = useQuery(Component.query, {
    variables: Component.variables(),
  });

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings ?? {};
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const works = data?.works?.nodes ?? [];
  const [featuredWork, ...remainingWorks] = works;

  return (
    <>
      <SEO title={siteTitle} description={siteDescription} />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
      <Main>
        <div className={cx('wrapper')}>
          {featuredWork && (
            <motion.div
              className={cx('hero')}
              initial={reveal.initial}
              animate={reveal.whileInView}
              transition={reveal.transition}
            >
              <Link href={featuredWork.uri} className={cx('hero-image')}>
                {featuredWork.featuredImage?.node && (
                  <ParallaxImage image={featuredWork.featuredImage.node} priority />
                )}
              </Link>
              <div className={cx('hero-text')}>
                <Heading className={cx('hero-title')}>
                  {featuredWork.title}
                </Heading>
                {featuredWork.excerpt ? (
                  <div
                    className={cx('hero-description')}
                    dangerouslySetInnerHTML={{ __html: featuredWork.excerpt }}
                  />
                ) : (
                  siteDescription && (
                    <p className={cx('hero-description')}>{siteDescription}</p>
                  )
                )}
              </div>
            </motion.div>
          )}

          <div className={cx('grid')}>
            {remainingWorks.map((work) => (
              <motion.div
                key={work.id}
                initial={reveal.initial}
                whileInView={reveal.whileInView}
                viewport={reveal.viewport}
                transition={reveal.transition}
              >
                <Link href={work.uri} className={cx('grid-item')}>
                  {work.featuredImage?.node && (
                    <div className={cx('grid-item-image')}>
                      <ParallaxImage image={work.featuredImage.node} />
                    </div>
                  )}
                  <div className={cx('grid-item-caption')}>
                    <Heading level="h2" className={cx('grid-item-title')}>
                      {work.title}
                      {work.workTypes?.nodes?.length > 0 &&
                        ` — ${work.workTypes.nodes.map((t) => t.name).join(', ')}`}
                    </Heading>
                    <span className={`${cx('grid-item-link')} link-underline`}>
                      View project
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Main>
      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetPortfolioPage(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    works {
      nodes {
        id
        title
        uri
        excerpt
        workTypes {
          nodes {
            name
          }
        }
        ...FeaturedImageFragment
      }
    }
    generalSettings {
      ...BlogInfoFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;

Component.variables = () => {
  return {
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
  };
};
