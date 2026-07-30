import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import { Container, NavigationMenu } from '../../components';
import styles from './Footer.module.scss';

let cx = classNames.bind(styles);

// Placeholder — not wired to WordPress content yet, swap freely.
const ADDRESS_LINES = ['59 Garden Street', 'South Yarra', 'Victoria, Australia 3141'];
const PHONE = '+61 3 8672 5999';
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
            <p className={cx('heading-lead')}>Talk to us about your project</p>
            <span className={cx('heading-cta', 'link-underline')}>Contact us</span>
          </div>

          <div className={cx('col-nav')}>
            <NavigationMenu menuItems={menuItems} vertical />

            <button
              type="button"
              className={cx('back-to-top')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back to top
            </button>
          </div>

          <div className={cx('col-info')}>
            <div className={cx('info-rows')}>
              <div className={cx('info-row')}>
                <span className={cx('info-prefix')}>L</span>
                <address className={cx('info-value')}>
                  {ADDRESS_LINES.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              </div>

              <div className={cx('info-row')}>
                <span className={cx('info-prefix')}>P</span>
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
              <a href={INSTAGRAM_URL} className="link-underline">Instagram</a>
              {', '}
              <a href={LINKEDIN_URL} className="link-underline">Linkedin</a>
            </p>
          </div>
        </motion.div>

        <p className={cx('copyright')}>
          {title} © {year}. Built by{' '}
          <a href="https://constantin.saguin.com" target="_blank" rel="noopener noreferrer">
            constantin.saguin
          </a>
        </p>
      </Container>
    </footer>
  );
}
