import Link from 'next/link';
import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import { Heading, ParallaxImage } from '../../components';
import styles from './NextProject.module.scss';

let cx = classNames.bind(styles);

const reveal = {
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-10%' },
	transition: { duration: 0.6, ease: 'easeOut' },
};

// Closing "next project" band — an oversized title with a small preview card,
// echoing the reference footer. `work` is the adjacent Work derived by date in
// the template (wrap-around), so it renders nothing only when there is no
// other project to point at.
export default function NextProject({ work }) {
	if (!work?.uri) {
		return null;
	}

	const category = work.workTypes?.nodes?.[0]?.name;

	return (
		<motion.section
			className={cx('component')}
			initial={reveal.initial}
			whileInView={reveal.whileInView}
			viewport={reveal.viewport}
			transition={reveal.transition}
		>
			<Link href={work.uri} className={cx('link')}>
				<span className={cx('eyebrow')}>Projet suivant</span>
				<div className={cx('body')}>
					<Heading className={cx('title')}>{work.title}</Heading>
					{work.featuredImage?.node && (
						<div className={cx('card')}>
							<ParallaxImage image={work.featuredImage.node} />
						</div>
					)}
				</div>
				{category && <span className={cx('category')}>{category}</span>}
			</Link>
		</motion.section>
	);
}
