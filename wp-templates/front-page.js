import { useQuery, gql } from '@apollo/client';
import { motion } from 'motion/react';
import classNames from 'classnames/bind';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
	Header,
	Footer,
	Main,
	Heading,
	FeaturedImage,
	ParallaxImage,
	NavigationMenu,
	SEO,
	WorksShowcase,
	WorkItemMedia,
	LOGO_LETTERS,
	LOGO_VIEWBOX,
} from '../components';
import styles from './front-page.module.scss';

let cx = classNames.bind(styles);

// ponytail: duplicated from page-projets.js; promote to a shared module if a third page needs it.
const reveal = {
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-10%' },
	transition: { duration: 0.6, ease: 'easeOut' },
};

// Placeholder copy — not wired to WordPress content yet, swap freely.
// Lines are broken manually so each reveals as its own masked line on scroll.
const STATEMENT_LINES = [
	'AMLA conçoit des lieux de vie',
	'sobres et durables, où le sens et',
	'l’équilibre priment toujours sur',
	'l’effet — une architecture pensée',
	'pour durer, et pour être vécue.',
];
const STATEMENT_SECONDARY =
	'Portée par le fond plutôt que par l’artifice, notre pratique privilégie des espaces justes : matériaux honnêtes, lumière maîtrisée, gestes simples. Chaque projet cherche l’essentiel, là où l’efficacité structurelle et la sensibilité esthétique se rejoignent.';

const TESTIMONIAL_QUOTE =
	'ML Archi a transformé notre maison en un lieu juste, lumineux et durable. Une écoute rare, une exigence constante du premier croquis à la dernière finition — et un résultat qui dépasse ce que nous imaginions.';
const TESTIMONIAL_AUTHOR = 'Famille Lefèvre — Maison Meinau';

export default function Component() {
	const { data } = useQuery(Component.query, {
		variables: Component.variables(),
	});

	const { title: siteTitle, description: siteDescription } = data?.generalSettings ?? {};
	const primaryMenu = data?.headerMenuItems?.nodes ?? [];
	const footerMenu = data?.footerMenuItems?.nodes ?? [];
	// works is ordered newest-first by default, so heroWork is the last
	// (most recent) Work post — reused below for the section 3 image too.
	const works = data?.works?.nodes ?? [];
	const [heroWork] = works;
	// The front page's own featured image (set in wp-admin on the "Accueil"
	// page) takes priority over borrowing a Work's image.
	const heroImage = data?.frontPage?.featuredImage?.node ?? heroWork?.featuredImage?.node;

	return (
		<>
			<SEO title={siteTitle} description={siteDescription} />
			<Header
				title={siteTitle}
				description={siteDescription}
				menuItems={primaryMenu}
				dark={false}
			/>
			<Main>
				<div className={cx('hero')}>
					{heroImage && (
						<motion.div
							className={cx('hero-image')}
							initial={{ scale: 1.15 }}
							animate={{ scale: 1 }}
							transition={{ duration: 1.2, ease: 'easeOut' }}
						>
							<ParallaxImage image={heroImage} priority />
						</motion.div>
					)}
					<div className={cx('hero-heading')}>
						<Heading className={cx('hero-title')}>
							{/*
                Letter-by-letter entrance, now drawn as the AMLA logo glyphs
                instead of text. Each letter is its own <g> so it can fade and
                slide up on its own delay; all glyphs share the logo's viewBox,
                so spacing matches the source mark exactly. The svg scales to
                the container width, so no font-fitting measurement is needed.
              */}
							<svg
								className={cx('hero-logo')}
								viewBox={LOGO_VIEWBOX}
								fill="currentColor"
								role="img"
								aria-label={siteTitle}
							>
								{LOGO_LETTERS.map((letter, i) => (
									<motion.g
										key={i}
										initial={{ opacity: 0, y: 14 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 1.4,
											ease: [0.22, 1, 0.36, 1],
											delay: 0.4 + i * 0.35,
										}}
									>
										{letter.paths.map((d, j) => (
											<path key={j} d={d} />
										))}
									</motion.g>
								))}
							</svg>
						</Heading>
					</div>
				</div>

				<section className={cx('section-statement')}>
					<Heading level="h2" className={cx('statement')}>
						{STATEMENT_LINES.map((line, i) => (
							// Each line fades/slides up on scroll, staggered so the
							// paragraph reveals line by line.
							<motion.span
								key={line}
								className={cx('statement-line')}
								initial={reveal.initial}
								whileInView={reveal.whileInView}
								viewport={reveal.viewport}
								transition={{ ...reveal.transition, delay: i * 0.09 }}
							>
								{line}
							</motion.span>
						))}
					</Heading>
					<motion.p
						className={cx('statement-secondary')}
						initial={reveal.initial}
						whileInView={reveal.whileInView}
						viewport={reveal.viewport}
						transition={{ ...reveal.transition, delay: 0.2 }}
					>
						{STATEMENT_SECONDARY}
					</motion.p>
				</section>

				{heroWork?.featuredImage?.node && (
					<motion.div
						className={cx('section-image')}
						initial={reveal.initial}
						whileInView={reveal.whileInView}
						viewport={reveal.viewport}
						transition={reveal.transition}
					>
						<ParallaxImage image={heroWork.featuredImage.node} />
					</motion.div>
				)}

				<section className={cx('section-testimonial')}>
					<blockquote className={cx('testimonial')}>
						<p className={cx('testimonial-quote')}>
							<span aria-hidden="true" className={cx('testimonial-mark')}>
								“
							</span>
							{/* Same reveal as the statement, per word — each fades/slides up
                  on scroll, staggered so the quote cascades in. */}
							{TESTIMONIAL_QUOTE.split(' ').map((word, i) => (
								<motion.span
									key={`${word}-${i}`}
									className={cx('testimonial-word')}
									initial={reveal.initial}
									whileInView={reveal.whileInView}
									viewport={reveal.viewport}
									transition={{ ...reveal.transition, delay: i * 0.025 }}
								>
									{`${word} `}
								</motion.span>
							))}
						</p>
						<motion.footer
							className={cx('testimonial-author')}
							initial={reveal.initial}
							whileInView={reveal.whileInView}
							viewport={reveal.viewport}
							transition={{ ...reveal.transition, delay: 0.2 }}
						>
							<span aria-hidden="true" className={cx('testimonial-bullet')} />
							{TESTIMONIAL_AUTHOR}
						</motion.footer>
					</blockquote>
				</section>

				<WorksShowcase works={works} viewAllHref="/projets" />
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

Component.query = gql`
	${BlogInfoFragment}
	${NavigationMenu.fragments.entry}
	${FeaturedImage.fragments.entry}
	${WorkItemMedia.fragments.entry}
	query GetPageData($headerLocation: MenuLocationEnum, $footerLocation: MenuLocationEnum) {
		frontPage: nodeByUri(uri: "/") {
			... on Page {
				...FeaturedImageFragment
			}
		}
		works {
			nodes {
				id
				title
				uri
				workCompletion
				workTypes {
					nodes {
						name
					}
				}
				...FeaturedImageFragment
				...WorkMediaFragment
			}
		}
		generalSettings {
			...BlogInfoFragment
		}
		headerMenuItems: menuItems(where: { location: $headerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
		footerMenuItems: menuItems(where: { location: $footerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
	}
`;

Component.variables = () => {
	return {
		headerLocation: MENUS.PRIMARY_LOCATION,
		footerLocation: MENUS.FOOTER_LOCATION,
	};
};
