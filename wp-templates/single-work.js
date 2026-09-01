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
	SafeHtml,
	WorkGallery,
	WorkItemMedia,
	WorkPrimaryMedia,
} from '../components';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import styles from './single-work.module.scss';
import { getSafeHttpUrl } from '../utils/urls';

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

// Queries the singular work through the generic contentNode lookup rather
// than a dedicated `work(id: ...)` root field — WPGraphQL's Work CPT is
// registered by a plugin whose registration bypasses the usual code path
// that would wire up that dedicated field (works/workTypes connections and
// the Work type itself resolve fine; only that one specific root field
// doesn't, for reasons that didn't pan out after a fair amount of digging).
// contentNode is the same generic node-by-id lookup WPGraphQL itself uses
// under the hood, aliased to `work` so the rest of this file is unchanged.
const GET_WORK_QUERY = gql`
	${FeaturedImage.fragments.entry}
	${WorkItemMedia.fragments.entry}
	query GetWork($databaseId: ID!, $asPreview: Boolean = false) {
		work: contentNode(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
			... on Work {
				id
				uri
				title
				excerpt
				content
				date
				workClient
				workProgram
				workSurface
				workCompletion
				workLink
				workTypes {
					nodes {
						name
					}
				}
				...FeaturedImageFragment
				...WorkMediaFragment
			}
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
		uri,
		title,
		excerpt,
		content,
		featuredImage,
		date,
		workClient,
		workProgram,
		workSurface,
		workCompletion,
		workLink,
		workTypes,
		workGallery,
	} = work ?? {};

	const nextWork = getNextWork(works?.nodes, id);
	const safeWorkLink = getSafeHttpUrl(workLink);
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
					<EntryHeader
						title={title}
						image={featuredImage?.node}
						mediaLayoutId={uri ? `work-media-${uri}` : undefined}
					/>

					<div className={cx('wrapper')}>
						{excerpt && <SafeHtml className={cx('intro')} html={excerpt} />}

						{(metaRows.length > 0 || safeWorkLink || hasBody) && (
							<div className={cx('details')}>
								{(metaRows.length > 0 || safeWorkLink) && (
									<dl className={cx('meta')}>
										{metaRows.map((row) => (
											<div key={row.label} className={cx('meta-row')}>
												<dt className={cx('meta-label')}>{row.label}</dt>
												<dd className={cx('meta-value')}>{row.value}</dd>
											</div>
										))}
										{safeWorkLink && (
											<div className={cx('meta-row')}>
												<dt className={cx('meta-label')}>Lien</dt>
												<dd className={cx('meta-value')}>
													<a href={safeWorkLink} target="_blank" rel="noopener noreferrer">
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

					<WorkPrimaryMedia work={work} />

					<WorkGallery images={workGallery} />

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
