import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import classNames from 'classnames/bind';
import FeaturedImage from '../FeaturedImage/FeaturedImage';
import ParallaxImage from '../ParallaxImage/ParallaxImage';
import { VIDEO_FILE_PATTERN } from '../../constants/media';
import styles from './WorkItemMedia.module.scss';

let cx = classNames.bind(styles);

// ponytail: a grid tile only has room for a real <video> background, not an
// embed — a video-format work whose meta is a YouTube/Vimeo link falls back
// to the featured image rather than an autoplaying iframe.
function GallerySlideshow({ images }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (images.length < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 2200);
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

	if (formatSlug === 'post-format-video' && videoUrl && VIDEO_FILE_PATTERN.test(videoUrl)) {
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

// Same fields, three call sites (front-page.js, page-projets.js,
// single-work.js) — spread once instead of re-listing per query.
WorkItemMedia.fragments = {
	entry: gql`
		fragment WorkMediaFragment on Work {
			workVideoUrl
			workGallery {
				id
				sourceUrl
				altText
				mediaDetails {
					width
					height
				}
			}
			postFormats {
				nodes {
					slug
				}
			}
		}
	`,
};
