import { gql } from '@apollo/client';
import classNames from 'classnames/bind';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
  Header,
  Footer,
  Main,
  Container,
  ContentWrapper,
  EntryHeader,
  Heading,
  NavigationMenu,
  FeaturedImage,
  SEO,
} from '../components';
import styles from './page.module.scss';

let cx = classNames.bind(styles);

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Chargement...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
  const { title, content, featuredImage } = props?.data?.page ?? { title: '' };

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
          {/* EntryHeader's 80vh cinematic hero only makes sense with an image
              to fill it — a plain content page (legal/utility pages, mostly)
              gets a normal in-flow title instead. */}
          {featuredImage?.node ? (
            <EntryHeader title={title} image={featuredImage.node} />
          ) : (
            <Container>
              <Heading className={cx('title')}>{title}</Heading>
            </Container>
          )}
          <Container>
            <ContentWrapper content={content} dense />
          </Container>
        </>
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
  ${FeaturedImage.fragments.entry}
  query GetPageData(
    $databaseId: ID!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $asPreview: Boolean = false
  ) {
    page(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
      ...FeaturedImageFragment
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
