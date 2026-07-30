import { gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import classNames from 'classnames/bind';
import { Header, Footer, Main, NavigationMenu, SEO } from '../components';
import styles from './page-about.module.scss';

let cx = classNames.bind(styles);

export default function Component(props) {
  if (props.loading) {
    return <>Chargement...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
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
      />
      <Main>
        {/* Not using ContentWrapper here — its own max-width (620px, tuned
            for prose articles) fights the 3-column layout this page needs.
            Content is still authored as plain core Gutenberg blocks
            (Columns/Heading/Paragraph) in wp-admin — see the .wrapper
            styles below for how .wp-block-columns is repurposed as the grid. */}
        <div
          className={cx('wrapper')}
          dangerouslySetInnerHTML={{ __html: content ?? '' }}
        />
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
  query GetAboutPage(
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
