import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import FeaturedImage from '../FeaturedImage/FeaturedImage';
import styles from './ParallaxImage.module.scss';

// ponytail: assumes it's placed inside a parent with `position: relative`
// and a real size (e.g. aspect-ratio) — it overlays that box exactly.
export default function ParallaxImage({ image, priority }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    <div ref={ref} className={styles.container}>
      <motion.div className={styles.inner} style={{ y }}>
        <FeaturedImage image={image} priority={priority} />
      </motion.div>
    </div>
  );
}
