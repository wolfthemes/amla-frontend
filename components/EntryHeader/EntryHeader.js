import { useState } from 'react';
import className from 'classnames/bind';
import { Heading, PostInfo, Container, FeaturedImage } from '../../components';
import { VIDEO_FILE_PATTERN } from '../../constants/media';
import styles from './EntryHeader.module.scss';

let cx = className.bind(styles);

// Visitor-paced hero gallery — arrows, not the grid tile's autoplay cycle,
// since a full-bleed hero is worth browsing deliberately rather than having
// cycle past on its own. Fades between slides the same way the grid's
// slideshow does.
function HeroSlideshow({ images }) {
	const [index, setIndex] = useState(0);
	const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length);

	return (
		<div className={cx('media', 'slideshow')}>
			{images.map((image, i) => (
				<div key={image.id ?? i} className={cx('slide', { active: i === index })}>
					<FeaturedImage image={image} priority={i === 0} />
				</div>
			))}

			{images.length > 1 && (
				<div className={cx('slideshow-nav')}>
					<button type="button" aria-label="Image précédente" onClick={() => go(-1)}>
						‹
					</button>
					<button type="button" aria-label="Image suivante" onClick={() => go(1)}>
						›
					</button>
				</div>
			)}
		</div>
	);
}

export default function EntryHeader({
	title,
	image,
	date,
	author,
	className,
	videoUrl,
	gallery = [],
}) {
	const hasText = title || date || author;
	const hasVideo = !!videoUrl && VIDEO_FILE_PATTERN.test(videoUrl);
	const hasGallery = gallery.length > 0;
	const hasMedia = !!image || hasVideo || hasGallery;

	return (
		<div className={cx(['component', className])}>
			{hasVideo && (
				<>
					{/* Featured image underneath so the hero isn't blank while the
              video downloads — the poster covers the same gap, but only
              once its own request resolves. */}
					{image && <FeaturedImage image={image} className={cx('media', 'image')} priority />}
					<video
						className={cx('media', 'video')}
						src={videoUrl}
						poster={image?.sourceUrl}
						controls
						playsInline
						preload="metadata"
					/>
				</>
			)}

			{!hasVideo && hasGallery && (
				<>
					{image && <FeaturedImage image={image} className={cx('media', 'image')} priority />}
					<HeroSlideshow images={gallery} />
				</>
			)}

			{!hasVideo && !hasGallery && image && (
				<FeaturedImage image={image} className={cx('media', 'image')} priority />
			)}

			{hasText && (
				<div className={cx('text', { 'has-image': hasMedia })}>
					<Container>
						{!!title && <Heading className={cx('title')}>{title}</Heading>}
						<PostInfo className={cx('byline')} author={author} date={date} />
					</Container>
				</div>
			)}
		</div>
	);
}
