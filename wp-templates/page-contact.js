import { gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import classNames from 'classnames/bind';
import { Header, Footer, Main, NavigationMenu, SEO } from '../components';
import styles from './page-contact.module.scss';

let cx = classNames.bind(styles);

export default function Component(props) {
	if (props.loading) {
		return <>Chargement...</>;
	}

	const { title: siteTitle, description: siteDescription } = props?.data?.generalSettings;
	const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
	const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
	const { title, content } = props?.data?.page ?? { title: '' };

	return (
		<>
			<SEO title={`${title} — ${siteTitle}`} description={siteDescription} />
			<Header
				title={siteTitle}
				description={siteDescription}
				menuItems={primaryMenu}
				transparent
				dark
			/>
			<Main>
				{/* Same approach as page-a-propos.js: authored in wp-admin as plain
            Gutenberg blocks (Columns > Heading/Paragraph + Image for the
            intro, then the Contact Form 7 shortcode block below), styled
            here by repurposing the generic block markup — see the .wrapper
            rules for how each block type maps onto the reference layout. */}
				<div className={cx('wrapper')} dangerouslySetInnerHTML={{ __html: content ?? '' }} />
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

Component.variables = ({ databaseId }, ctx) => {
	return {
		databaseId,
		headerLocation: MENUS.PRIMARY_LOCATION,
		footerLocation: MENUS.FOOTER_LOCATION,
		asPreview: ctx?.asPreview,
	};
};

Component.query = gql`
	${BlogInfoFragment}
	${NavigationMenu.fragments.entry}
	query GetContactPage(
		$databaseId: ID!
		$headerLocation: MenuLocationEnum
		$footerLocation: MenuLocationEnum
		$asPreview: Boolean = false
	) {
		page(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
			title
			content
		}
		generalSettings {
			...BlogInfoFragment
		}
		footerMenuItems: menuItems(where: { location: $footerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
		headerMenuItems: menuItems(where: { location: $headerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
	}
`;
