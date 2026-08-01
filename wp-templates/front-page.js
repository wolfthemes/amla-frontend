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
  WorksShowcase,
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
// Lines are broken manually so each reveals as its own masked line on scroll.
const STATEMENT_LINES = [
  'ML Archi conçoit des lieux de vie',
  'sobres et durables, où le sens et',
  'l’équilibre priment toujours sur',
  'l’effet — une architecture pensée',
  'pour durer, et pour être vécue.',
];
const STATEMENT_SECONDARY =
  'Portée par le fond plutôt que par l’artifice, notre pratique privilégie des espaces justes : matériaux honnêtes, lumière maîtrisée, gestes simples. Chaque projet cherche l’essentiel, là où l’efficacité structurelle et la sensibilité esthétique se rejoignent.';

const PHILOSOPHY_EYEBROW = 'Notre philosophie';
const PHILOSOPHY_HEADING = 'Une architecture du sens et de l’équilibre';
const PHILOSOPHY_PARAGRAPHS = [
  'Notre vision est avant tout guidée par votre bien-être. Notre maîtrise des étapes et des techniques architecturales et de design vous garantit un travail dans le respect de votre personnalité, de l’identité de votre projet, du temps, du coût et du lieu. Nous revendiquons une architecture et un design simples, efficaces et sincères, sans effets de manche, sans artifice. Notre recherche est basée sur l’équilibre : connaître les tendances sans céder aux modes éphémères, proposer une esthétique sans rien sacrifier à la fonctionnalité, créer de la surprise uniquement si cela crée du sens, détourner l’usage premier des matériaux sans les dénaturer, aller vers un minimal qui reste convivial, inventer pour mieux pérenniser, etc.',
  'C’est peut-être ça le style ABCD Architecture : des réalisations qui vont à l’essentiel tout en manifestant une créativité sensible et ludique.',
];

export default function Component() {
  const { data } = useQuery(Component.query, {
    variables: Component.variables(),
  });

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings ?? {};
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  // works is ordered newest-first by default, so heroWork is the last
  // (most recent) Work post — reused below for the section 3 image too.
  const works = data?.works?.nodes ?? [];
  const [heroWork] = works;
  // The front page's own featured image (set in wp-admin on the "Accueil"
  // page) takes priority over borrowing a Work's image.
  const heroImage = data?.frontPage?.featuredImage?.node ?? heroWork?.featuredImage?.node;

  return (
    <>
      <SEO title={siteTitle} description={siteDescription} />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
        dark={false}
      />
      <Main>
        <div className={cx('hero')}>
          {heroImage && (
            <motion.div
              className={cx('hero-image')}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <ParallaxImage image={heroImage} priority />
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

        <section className={cx('section-statement')}>
          <Heading level="h2" className={cx('statement')}>
            {STATEMENT_LINES.map((line, i) => (
              // Each line fades/slides up on scroll, staggered so the
              // paragraph reveals line by line.
              <motion.span
                key={line}
                className={cx('statement-line')}
                initial={reveal.initial}
                whileInView={reveal.whileInView}
                viewport={reveal.viewport}
                transition={{ ...reveal.transition, delay: i * 0.09 }}
              >
                {line}
              </motion.span>
            ))}
          </Heading>
          <motion.p
            className={cx('statement-secondary')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={{ ...reveal.transition, delay: 0.2 }}
          >
            {STATEMENT_SECONDARY}
          </motion.p>
        </section>

        {heroWork?.featuredImage?.node && (
          <motion.div
            className={cx('section-image')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            <ParallaxImage image={heroWork.featuredImage.node} />
          </motion.div>
        )}

        <section className={cx('section-philosophy')}>
          <motion.span
            className={cx('section-eyebrow')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            {PHILOSOPHY_EYEBROW}
          </motion.span>
          <Heading level="h2" className={cx('section-heading')}>
            <motion.span
              className={cx('section-heading-line')}
              initial={reveal.initial}
              whileInView={reveal.whileInView}
              viewport={reveal.viewport}
              transition={reveal.transition}
            >
              {PHILOSOPHY_HEADING}
            </motion.span>
          </Heading>
          <motion.div
            className={cx('section-philosophy-text')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            {PHILOSOPHY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </motion.div>
        </section>

        <WorksShowcase works={works} viewAllHref="/portfolio" />
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
    frontPage: nodeByUri(uri: "/") {
      ... on Page {
        ...FeaturedImageFragment
      }
    }
    works {
      nodes {
        id
        title
        uri
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
