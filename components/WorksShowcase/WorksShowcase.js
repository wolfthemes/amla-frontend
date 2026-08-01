import Link from 'next/link';
import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import { Heading, ParallaxImage } from '../../components';
import styles from './WorksShowcase.module.scss';

let cx = classNames.bind(styles);

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

// Homepage "recent work" module — a fixed 7-item composition (one wide +
// two narrow, then two uneven pairs), deliberately different from the
// portfolio page's repeating grid rhythm. Ref: yoointerior.com homepage.
export default function WorksShowcase({ works = [], viewAllHref = '/portfolio' }) {
  const items = works.slice(0, 7);

  if (!items.length) {
    return null;
  }

  return (
    <section className={cx('component')}>
      <div className={cx('grid')}>
        {items.map((work) => (
          <motion.div
            key={work.id}
            className={cx('item')}
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={reveal.viewport}
            transition={reveal.transition}
          >
            <Link href={work.uri} className={cx('item-link')}>
              {work.featuredImage?.node && (
                <div className={cx('item-image')}>
                  <ParallaxImage image={work.featuredImage.node} />
                  {/* Same hover overlay as the portfolio grid: category + title
                      on the left, réalisation year right, over a scrim. */}
                  <div className={cx('item-overlay')}>
                    <div className={cx('item-text')}>
                      {work.workTypes?.nodes?.[0]?.name && (
                        <span className={cx('item-category')}>
                          {work.workTypes.nodes[0].name}
                        </span>
                      )}
                      <div className={cx('item-line')}>
                        <Heading level="h3" className={cx('item-title')}>
                          {work.title}
                        </Heading>
                        {work.workCompletion && (
                          <span className={cx('item-year')}>
                            {work.workCompletion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href={viewAllHref}
        className={cx('view-all')}
        aria-label="Voir tous les projets"
      >
        {/* Two arrows on a horizontal track; on hover the track slides one
            cell so the visible arrow exits right and a duplicate wipes in from
            the left — a horizontal echo of the menu's underline reveal. */}
        <span className={cx('arrow-track')} aria-hidden="true">
          <span className={cx('arrow')}>→</span>
          <span className={cx('arrow')}>→</span>
        </span>
      </Link>
    </section>
  );
}
