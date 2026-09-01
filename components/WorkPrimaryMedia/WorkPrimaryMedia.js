import { useState } from 'react';
import classNames from 'classnames/bind';
import { FeaturedImage } from '../../components';
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
// text: video plays workVideoUrl, otherwise a gallery slider of workGallery
// — checked directly (gallery.length > 0) rather than gated on the
// post-format taxonomy, since a work can have gallery images without that
// tag being set. Renders nothing when neither exists, rather than falling
// back to the featured image — that image already had its moment in
// EntryHeader's hero a few hundred pixels up; showing the exact same photo
// again here read as a mistake, not a design choice.
export default function WorkPrimaryMedia({ work }) {
	const formatSlug = work?.postFormats?.nodes?.[0]?.slug;
	const videoUrl = work?.workVideoUrl;
	const safeVideoUrl = getSafeHttpUrl(videoUrl);
	const gallery = work?.workGallery ?? [];

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
	} else if (gallery.length > 0) {
		content = <MediaSlider images={gallery} />;
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
