import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import { ParallaxImage } from '../../components';
import styles from './WorkGallery.module.scss';

let cx = classNames.bind(styles);

const reveal = {
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-10%' },
	transition: { duration: 0.6, ease: 'easeOut' },
};

const isPortrait = (img) => {
	const { width, height } = img?.mediaDetails ?? {};
	return width && height ? height > width : false;
};

// Turn the flat, editor-ordered gallery into an editorial rhythm of rows.
// The backend leaves layout to us ("order defines the layout, the frontend
// applies its own rhythm"), so orientation drives the treatment: consecutive
// portraits pair up, lone portraits get a centred inset, and landscapes go
// full-bleed — with every third landscape pulled into a narrower inset so a
// run of wide shots doesn't read as monotonous.
const buildRows = (images) => {
	const rows = [];
	let i = 0;
	let landscapeCount = 0;

	while (i < images.length) {
		const img = images[i];
		const next = images[i + 1];

		if (isPortrait(img) && isPortrait(next)) {
			rows.push({ type: 'pair', items: [img, next] });
			i += 2;
			continue;
		}

		if (isPortrait(img)) {
			rows.push({ type: 'center', items: [img] });
			i += 1;
			continue;
		}

		// Landscape.
		rows.push({ type: landscapeCount % 3 === 1 ? 'inset' : 'full', items: [img] });
		landscapeCount += 1;
		i += 1;
	}

	return rows;
};

const VIDEO_FILE = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

function GalleryImage({ image, priority }) {
	return (
		<div className={cx('frame')}>
			<ParallaxImage image={image} priority={priority} />
		</div>
	);
}

export default function WorkGallery({ images = [], videoUrl }) {
	const rows = buildRows(images ?? []);

	if (!rows.length && !videoUrl) {
		return null;
	}

	return (
		<section className={cx('component')}>
			{rows.map((row, index) => (
				<motion.div
					key={row.items[0]?.id ?? index}
					className={cx('row', row.type)}
					initial={reveal.initial}
					whileInView={reveal.whileInView}
					viewport={reveal.viewport}
					transition={reveal.transition}
				>
					{row.items.map((image, itemIndex) => (
						<GalleryImage
							key={image?.id ?? itemIndex}
							image={image}
							priority={index === 0 && itemIndex === 0}
						/>
					))}
				</motion.div>
			))}

			{videoUrl && (
				<motion.div
					className={cx('row', 'full')}
					initial={reveal.initial}
					whileInView={reveal.whileInView}
					viewport={reveal.viewport}
					transition={reveal.transition}
				>
					<div className={cx('frame', 'video')}>
						{VIDEO_FILE.test(videoUrl) ? (
							<video src={videoUrl} controls playsInline preload="metadata" />
						) : (
							<iframe
								src={videoUrl}
								title="Vidéo du projet"
								allow="autoplay; fullscreen; picture-in-picture"
								allowFullScreen
							/>
						)}
					</div>
				</motion.div>
			)}
		</section>
	);
}
