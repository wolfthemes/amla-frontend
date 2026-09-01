import classNames from 'classnames/bind';
import { VIDEO_FILE_PATTERN } from '../../constants/media';
import styles from './WorkPrimaryMedia.module.scss';
import { getSafeEmbedUrl, getSafeHttpUrl } from '../../utils/urls';

let cx = classNames.bind(styles);

// Gallery-format slideshow disabled here — post-format-gallery now only
// drives the WorkItemMedia crossfade in the grid tile (WorkItemMedia.js).
// The single-work page's own media layout (this section vs. WorkGallery
// below it, which currently pull from the same workGallery field and so
// repeat the same photos back to back) still needs a real design pass.
// Re-enable by restoring MediaSlider and the `gallery.length > 0` branch
// once that's settled — see git history for the previous implementation.
//
// function MediaSlider({ images }) { ... }

// The single-work page's "post media" section, right below the intro/details
// text — video only, for now (see note above).
export default function WorkPrimaryMedia({ work }) {
	const formatSlug = work?.postFormats?.nodes?.[0]?.slug;
	const videoUrl = work?.workVideoUrl;
	const safeVideoUrl = getSafeHttpUrl(videoUrl);

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
