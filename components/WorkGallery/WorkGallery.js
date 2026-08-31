import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import classNames from 'classnames/bind';
import { FeaturedImage, ParallaxImage } from '../../components';
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

// Both the thumbnail (below) and the lightbox frame share this layoutId, so
// motion animates the FLIP transition between the two automatically — no
// separate open/close animation to hand-author.
const lightboxLayoutId = (image, i) => `gallery-image-${image?.id ?? i}`;

function GalleryImage({ image, priority, onOpen }) {
	return (
		<motion.div
			className={cx('frame')}
			layoutId={lightboxLayoutId(image)}
			onClick={onOpen}
			role="button"
			tabIndex={0}
			aria-label="Agrandir l’image"
			onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
		>
			<ParallaxImage image={image} priority={priority} />
		</motion.div>
	);
}

function Lightbox({ images, index, onClose, onNavigate }) {
	const image = images[index];

	// Lock background scroll and wire arrow-key/Escape navigation while open.
	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const onKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowLeft') onNavigate(-1);
			if (e.key === 'ArrowRight') onNavigate(1);
		};
		window.addEventListener('keydown', onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [onClose, onNavigate]);

	if (!image) {
		return null;
	}

	return (
		<motion.div
			className={cx('lightbox')}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
		>
			<motion.div
				className={cx('lightbox-frame')}
				layoutId={lightboxLayoutId(image, index)}
				onClick={(e) => e.stopPropagation()}
			>
				<FeaturedImage image={image} style={{ objectFit: 'contain' }} />
			</motion.div>

			<button type="button" className={cx('lightbox-close')} aria-label="Fermer" onClick={onClose}>
				×
			</button>

			{images.length > 1 && (
				<div className={cx('lightbox-nav')}>
					<button
						type="button"
						aria-label="Image précédente"
						onClick={(e) => {
							e.stopPropagation();
							onNavigate(-1);
						}}
					>
						‹
					</button>
					<button
						type="button"
						aria-label="Image suivante"
						onClick={(e) => {
							e.stopPropagation();
							onNavigate(1);
						}}
					>
						›
					</button>
				</div>
			)}
		</motion.div>
	);
}

export default function WorkGallery({ images = [] }) {
	const [openIndex, setOpenIndex] = useState(null);
	const rows = buildRows(images ?? []);

	if (!rows.length) {
		return null;
	}

	const navigate = (delta) => {
		setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length));
	};

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
							onOpen={() => setOpenIndex(images.indexOf(image))}
						/>
					))}
				</motion.div>
			))}

			<AnimatePresence>
				{openIndex !== null && (
					<Lightbox
						images={images}
						index={openIndex}
						onClose={() => setOpenIndex(null)}
						onNavigate={navigate}
					/>
				)}
			</AnimatePresence>
		</section>
	);
}
