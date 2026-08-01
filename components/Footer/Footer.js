import Link from 'next/link';
import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import { Container, NavigationMenu } from '../../components';
import styles from './Footer.module.scss';

let cx = classNames.bind(styles);

// Placeholder — not wired to WordPress content yet, swap freely.
const ADDRESS_LINES = ['59 Garden Street', 'South Yarra', '67000 Strasbourg, France'];
const PHONE = '+336 XX XX XX XX';
const EMAIL = 'contact@ml-archi.com';
const INSTAGRAM_URL = '#';
const LINKEDIN_URL = '#';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default function Footer({ title, menuItems }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cx('component')}>
      <Container>
        <motion.div
          className={cx('grid')}
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={reveal.viewport}
          transition={reveal.transition}
        >
          <div className={cx('col-heading')}>
            <p className={cx('heading-lead')}>Parlez-nous de votre projet</p>
            <Link href="/contact" className={cx('heading-cta', 'link-underline')}>
              Contactez-nous
            </Link>
          </div>

          <div className={cx('col-nav')}>
            <NavigationMenu menuItems={menuItems} vertical />

            <button
              type="button"
              className={cx('back-to-top')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Retour en haut
            </button>
          </div>

          <div className={cx('col-info')}>
            <div className={cx('info-rows')}>
              <div className={cx('info-row')}>
                <span className={cx('info-prefix')}>A</span>
                <address className={cx('info-value')}>
                  {ADDRESS_LINES.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              </div>

              <div className={cx('info-row')}>
                <span className={cx('info-prefix')}>T</span>
                <a className={cx('info-value')} href={`tel:${PHONE.replace(/\s/g, '')}`}>
                  {PHONE}
                </a>
              </div>

              <div className={cx('info-row')}>
                <span className={cx('info-prefix')}>C</span>
                <a className={cx('info-value')} href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </div>
            </div>

            <p className={cx('social')}>
              <a href={INSTAGRAM_URL} className={cx('social-link', 'link-underline')}>
                Instagram
                <span className={cx('arrow')} aria-hidden="true">↗</span>
              </a>
              {', '}
              <a href={LINKEDIN_URL} className={cx('social-link', 'link-underline')}>
                Linkedin
                <span className={cx('arrow')} aria-hidden="true">↗</span>
              </a>
            </p>
          </div>
        </motion.div>

        <p className={cx('copyright')}>
          {title} © {year}. Créé par{' '}
          <a href="https://constantin.saguin.com" target="_blank" rel="noopener noreferrer">
            constantin.saguin
          </a>
        </p>
      </Container>
    </footer>
  );
}
