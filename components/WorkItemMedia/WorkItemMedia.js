import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import FeaturedImage from '../FeaturedImage/FeaturedImage';
import ParallaxImage from '../ParallaxImage/ParallaxImage';
import styles from './WorkItemMedia.module.scss';

let cx = classNames.bind(styles);

const VIDEO_FILE = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

// ponytail: a grid tile only has room for a real <video> background, not an
// embed — a video-format work whose meta is a YouTube/Vimeo link falls back
// to the featured image rather than an autoplaying iframe.
function GallerySlideshow({ images }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (images.length < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3500);
		return () => clearInterval(id);
	}, [images.length]);

	return (
		<div className={cx('slideshow')}>
			{images.map((image, i) => (
				<div key={image.id ?? i} className={cx('slide', { active: i === index })}>
					<FeaturedImage image={image} />
				</div>
			))}
		</div>
	);
}

// Grid item background, driven by the work's post format: "video" plays its
// video meta, "gallery" cycles its gallery meta as a slideshow, everything
// else — including a video/gallery format work whose meta is empty — falls
// back to the plain featured image.
export default function WorkItemMedia({ work, priority }) {
	const formatSlug = work?.postFormats?.nodes?.[0]?.slug;
	const videoUrl = work?.workVideoUrl;
	const gallery = work?.workGallery ?? [];
	const featuredImage = work?.featuredImage?.node;

	if (formatSlug === 'post-format-video' && videoUrl && VIDEO_FILE.test(videoUrl)) {
		return (
			<>
				{/* Featured image underneath so the tile isn't blank while the
				    video downloads — the poster covers the same gap, but only
				    once its own request resolves. */}
				<ParallaxImage image={featuredImage} priority={priority} />
				<video
					className={cx('video')}
					src={videoUrl}
					poster={featuredImage?.sourceUrl}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
				/>
			</>
		);
	}

	if (formatSlug === 'post-format-gallery' && gallery.length > 0) {
		return (
			<>
				<ParallaxImage image={featuredImage} priority={priority} />
				<GallerySlideshow images={gallery} />
			</>
		);
	}

	return <ParallaxImage image={featuredImage} priority={priority} />;
}
