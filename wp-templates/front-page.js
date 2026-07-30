import { useQuery, gql } from '@apollo/client';
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
import styles from './front-page.module.scss';

let cx = classNames.bind(styles);

// ponytail: duplicated from page-portfolio.js; promote to a shared module if a third page needs it.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

// Placeholder copy — not wired to WordPress content yet, swap freely.
const SECTION_HEADING_LINES = ['Systematic Clarity', '& Creativity'];
const SECTION_PARAGRAPHS = [
  'Sustainability strategy, material efficiency, passive systems, energy modeling, lifecycle analysis.',
  'Concept, facade and planning solutions, sketch project, working documentation, visualizations.',
];

export default function Component() {
  const { data } = useQuery(Component.query, {
    variables: Component.variables(),
  });

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings ?? {};
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const works = data?.works?.nodes ?? [];
  const [heroWork, sectionWork] = works;

  return (
    <>
      <SEO title={siteTitle} description={siteDescription} />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
        transparent
      />
      <Main>
        <div className={cx('hero')}>
          {heroWork?.featuredImage?.node && (
            <motion.div
              className={cx('hero-image')}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <ParallaxImage image={heroWork.featuredImage.node} priority />
            </motion.div>
          )}
          <motion.div
            className={cx('hero-heading')}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          >
            <Heading className={cx('hero-title')}>{siteTitle}</Heading>
          </motion.div>
        </div>

        <section className={cx('section-text')}>
          <Heading level="h2" className={cx('section-heading')}>
            {SECTION_HEADING_LINES.map((line, i) => (
              <motion.span
                key={line}
                className={cx('section-heading-line')}
                initial={reveal.initial}
                whileInView={reveal.whileInView}
                viewport={reveal.viewport}
                transition={{ ...reveal.transition, delay: i * 0.1 }}
              >
                {line}
              </motion.span>
            ))}
          </Heading>
          <motion.div
            className={cx('section-columns')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            {SECTION_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </motion.div>
        </section>

        {sectionWork?.featuredImage?.node && (
          <motion.div
            className={cx('section-image')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            <ParallaxImage image={sectionWork.featuredImage.node} />
          </motion.div>
        )}
      </Main>
      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetPageData(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    works {
      nodes {
        id
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
