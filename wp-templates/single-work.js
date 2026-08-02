import { gql } from '@apollo/client';
import { useFaustQuery } from '@faustwp/core';
import classNames from 'classnames/bind';
import {
	ContentWrapper,
	EntryHeader,
	FeaturedImage,
	Footer,
	Header,
	Main,
	NavigationMenu,
	NextProject,
	SEO,
	WorkGallery,
} from '../components';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import styles from './single-work.module.scss';

let cx = classNames.bind(styles);

const GET_LAYOUT_QUERY = gql`
	${BlogInfoFragment}
	${NavigationMenu.fragments.entry}
	query GetLayout($headerLocation: MenuLocationEnum, $footerLocation: MenuLocationEnum) {
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

const GET_WORK_QUERY = gql`
	${FeaturedImage.fragments.entry}
	query GetWork($databaseId: ID!, $asPreview: Boolean = false) {
		work(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
			id
			title
			excerpt
			content
			date
			workClient
			workProgram
			workSurface
			workCompletion
			workVideoUrl
			workLink
			workTypes {
				nodes {
					name
				}
			}
			workGallery {
				id
				sourceUrl
				altText
				mediaDetails {
					width
					height
				}
			}
			...FeaturedImageFragment
		}
	}
`;

// Lightweight list used only to derive the adjacent project (there is no
// next-project relation field). Ordered by date on the client so the "next"
// pick is deterministic regardless of the backend's default order.
const GET_WORKS_NAV_QUERY = gql`
	${FeaturedImage.fragments.entry}
	query GetWorksNav {
		works(first: 100) {
			nodes {
				id
				title
				uri
				date
				workTypes {
					nodes {
						name
					}
				}
				...FeaturedImageFragment
			}
		}
	}
`;

// The Work following `currentId` in date-descending order, wrapping back to
// the first once past the oldest. Returns undefined when there's no other
// project to point at.
function getNextWork(nodes, currentId) {
	if (!nodes?.length || nodes.length < 2 || !currentId) {
		return undefined;
	}

	const ordered = [...nodes].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	const index = ordered.findIndex((work) => work.id === currentId);

	if (index === -1) {
		return undefined;
	}

	return ordered[(index + 1) % ordered.length];
}

export default function Component(props) {
	// Hooks must run unconditionally and in a stable order, so they precede the
	// loading early-return. useFaustQuery can return undefined before its data
	// lands in the Apollo cache (e.g. client-side nav / hydration timing), so
	// default to {} to avoid destructuring undefined.
	const { work } = useFaustQuery(GET_WORK_QUERY) ?? {};
	const { generalSettings, headerMenuItems, footerMenuItems } =
		useFaustQuery(GET_LAYOUT_QUERY) ?? {};
	const { works } = useFaustQuery(GET_WORKS_NAV_QUERY) ?? {};

	if (props.loading) {
		return <>Chargement...</>;
	}

	const { title: siteTitle, description: siteDescription } = generalSettings ?? {};
	const primaryMenu = headerMenuItems?.nodes ?? [];
	const footerMenu = footerMenuItems?.nodes ?? [];
	const {
		id,
		title,
		excerpt,
		content,
		featuredImage,
		date,
		workClient,
		workProgram,
		workSurface,
		workCompletion,
		workVideoUrl,
		workLink,
		workTypes,
		workGallery,
	} = work ?? {};

	const nextWork = getNextWork(works?.nodes, id);
	const hasBody = !!(content && content.trim());

	// Project facts, in the reference's order. Rendered only when set.
	const metaRows = [
		{ label: "Maître d'ouvrage", value: workClient },
		{ label: 'Programme', value: workProgram },
		{ label: 'Surface', value: workSurface },
		{ label: 'Réalisation', value: workCompletion },
		{
			label: 'Type',
			value: workTypes?.nodes?.length ? workTypes.nodes.map((t) => t.name).join(', ') : null,
		},
	].filter((row) => row.value);

	return (
		<>
			<SEO
				title={siteTitle}
				description={siteDescription}
				imageUrl={featuredImage?.node?.sourceUrl}
			/>
			<Header
				title={siteTitle}
				description={siteDescription}
				menuItems={primaryMenu}
				transparent
				dark={!featuredImage?.node}
			/>
			<Main>
				<>
					<EntryHeader title={title} image={featuredImage?.node} date={date} />

					<div className={cx('wrapper')}>
						{excerpt && (
							<div className={cx('intro')} dangerouslySetInnerHTML={{ __html: excerpt }} />
						)}

						{(metaRows.length > 0 || workLink || hasBody) && (
							<div className={cx('details')}>
								{(metaRows.length > 0 || workLink) && (
									<dl className={cx('meta')}>
										{metaRows.map((row) => (
											<div key={row.label} className={cx('meta-row')}>
												<dt className={cx('meta-label')}>{row.label}</dt>
												<dd className={cx('meta-value')}>{row.value}</dd>
											</div>
										))}
										{workLink && (
											<div className={cx('meta-row')}>
												<dt className={cx('meta-label')}>Lien</dt>
												<dd className={cx('meta-value')}>
													<a href={workLink} target="_blank" rel="noreferrer">
														Voir le site
													</a>
												</dd>
											</div>
										)}
									</dl>
								)}

								{hasBody && <ContentWrapper content={content} />}
							</div>
						)}
					</div>

					<WorkGallery images={workGallery} videoUrl={workVideoUrl} />

					<NextProject work={nextWork} />
				</>
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

Component.queries = [
	{
		query: GET_LAYOUT_QUERY,
		variables: (seedNode, ctx) => ({
			headerLocation: MENUS.PRIMARY_LOCATION,
			footerLocation: MENUS.FOOTER_LOCATION,
		}),
	},
	{
		query: GET_WORK_QUERY,
		variables: ({ databaseId }, ctx) => ({
			databaseId,
			asPreview: ctx?.asPreview,
		}),
	},
	{
		query: GET_WORKS_NAV_QUERY,
		variables: () => ({}),
	},
];
