import { useState } from 'react';
import classNames from 'classnames/bind';
import { FeaturedImage, ParallaxImage } from '../../components';
import { VIDEO_FILE_PATTERN } from '../../constants/media';
import styles from './WorkPrimaryMedia.module.scss';
import { getSafeEmbedUrl, getSafeHttpUrl } from '../../utils/urls';

let cx = classNames.bind(styles);

// Visitor-paced, arrow-controlled crossfade — same treatment as the
// (now-reverted) hero slideshow, sized for a normal content section instead
// of a full-bleed hero.
function MediaSlider({ images }) {
	const [index, setIndex] = useState(0);
	const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length);

	return (
		<div className={cx('slider')}>
			{images.map((image, i) => (
				<div key={image.id ?? i} className={cx('slide', { active: i === index })}>
					<FeaturedImage image={image} priority={i === 0} />
				</div>
			))}

			{images.length > 1 && (
				<div className={cx('slider-nav')}>
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

// The single-work page's "post media" section, right below the intro/details
// text — its content is entirely driven by the work's post format: video
// plays workVideoUrl, gallery gets an arrow-controlled slider of
// workGallery, everything else (including a video/gallery format work whose
// meta is empty) falls back to the plain featured image. Same gating rule
// as WorkItemMedia (the grid tile), just presented full-size instead of
// cropped into a tile.
export default function WorkPrimaryMedia({ work }) {
	const formatSlug = work?.postFormats?.nodes?.[0]?.slug;
	const videoUrl = work?.workVideoUrl;
	const safeVideoUrl = getSafeHttpUrl(videoUrl);
	const gallery = work?.workGallery ?? [];
	const featuredImage = work?.featuredImage?.node;

	let content;

	if (formatSlug === 'post-format-video' && safeVideoUrl) {
		const embedUrl = getSafeEmbedUrl(safeVideoUrl);
		content = VIDEO_FILE_PATTERN.test(safeVideoUrl) ? (
			<video src={safeVideoUrl} controls playsInline preload="metadata" />
		) : embedUrl ? (
			<iframe
				src={embedUrl}
				title="Vidéo du projet"
				allow="autoplay; fullscreen; picture-in-picture"
				allowFullScreen
			/>
		) : null;
	} else if (formatSlug === 'post-format-gallery' && gallery.length > 0) {
		content = <MediaSlider images={gallery} />;
	} else if (featuredImage) {
		content = <ParallaxImage image={featuredImage} priority />;
	}

	if (!content) {
		return null;
	}

	return (
		<section className={cx('component')}>
			<div className={cx('frame')}>{content}</div>
		</section>
	);
}
