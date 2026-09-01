import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import className from 'classnames/bind';
import { Heading, PostInfo, Container, FeaturedImage } from '../../components';
import styles from './EntryHeader.module.scss';

let cx = className.bind(styles);

// Per-character reveal, word-grouped so a word never wraps mid-animation —
// each word is its own nowrap span, with a real (breakable) space between
// words so long titles still wrap normally on narrow screens. Same
// fade+slide-up used for the front page's testimonial, just staggered per
// letter instead of per word for a title-sized amount of text.
function AnimatedTitle({ text }) {
	const words = text.split(' ');
	let charIndex = 0;

	return words.flatMap((word, wi) => {
		// The space must be a sibling of the nowrap word span, not its last
		// child — a trailing space inside a white-space: nowrap inline-block
		// gets trimmed by the browser at the box's own edge, which is what
		// was swallowing the gaps between words.
		const wordEl = (
			<span key={`word-${wi}`} className={cx('title-word')}>
				{Array.from(word).map((char, ci) => {
					const delay = 0.3 + charIndex * 0.025;
					charIndex += 1;
					return (
						<motion.span
							key={ci}
							className={cx('title-char')}
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
						>
							{char}
						</motion.span>
					);
				})}
			</span>
		);

		return wi < words.length - 1 ? [wordEl, ' '] : [wordEl];
	});
}

export default function EntryHeader({ title, image, date, author, className, mediaLayoutId }) {
	const hasText = title || date || author;
	const ref = useRef(null);

	// Subtle zoom + parallax + blur as the hero scrolls past — progress 0 at
	// the top of the page, 1 once the hero's bottom edge reaches the viewport
	// top. The title fades/lifts a bit faster than the image so it's clear of
	// the frame before the blur gets heavy.
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start start', 'end start'],
	});
	const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
	const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
	const blurPx = useTransform(scrollYProgress, [0, 1], [0, 5]);
	const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
	const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
	const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

	return (
		<div ref={ref} className={cx(['component', className])}>
			{image && (
				// motion.div regardless of whether mediaLayoutId is passed —
				// layoutId is simply undefined (a no-op) for every other
				// EntryHeader caller (page.js, single.js, category.js, tag.js),
				// so this stays a plain static box for them.
				<motion.div className={cx('media')} layoutId={mediaLayoutId}>
					{/* Entrance-only zoom-in (mount, once) — separate layer from the
              scroll-driven transform below so the two never fight over the
              same `scale`. */}
					<motion.div
						className={cx('media-entrance')}
						initial={{ scale: 1.15 }}
						animate={{ scale: 1 }}
						transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
					>
						<motion.div className={cx('media-inner')} style={{ scale, y, filter }}>
							<FeaturedImage image={image} className={cx('image')} priority />
						</motion.div>
					</motion.div>
				</motion.div>
			)}

			{hasText && (
				<motion.div
					className={cx('text', { 'has-image': image })}
					style={{ opacity: textOpacity, y: textY }}
				>
					<Container>
						{!!title && (
							<Heading className={cx('title')}>
								<AnimatedTitle text={title} />
							</Heading>
						)}
						<PostInfo className={cx('byline')} author={author} date={date} />
					</Container>
				</motion.div>
			)}
		</div>
	);
}
