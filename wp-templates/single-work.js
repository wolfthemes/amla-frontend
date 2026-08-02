import { gql } from '@apollo/client';
import { useFaustQuery } from '@faustwp/core';
import {
  Container,
  ContentWrapper,
  EntryHeader,
  FeaturedImage,
  Footer,
  Header,
  Main,
  NavigationMenu,
  SEO,
} from '../components';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';

const GET_LAYOUT_QUERY = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  query GetLayout(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
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
      title
      content
      date
      workClient
      workLink
      workTypes {
        nodes {
          name
        }
      }
      ...FeaturedImageFragment
    }
  }
`;

export default function Component(props) {
  if (props.loading) {
    return <>Chargement...</>;
  }

  // useFaustQuery can return undefined before its data lands in the Apollo
  // cache (e.g. client-side nav / hydration timing), so default to {} to avoid
  // destructuring undefined.
  const { work } = useFaustQuery(GET_WORK_QUERY) ?? {};
  const { generalSettings, headerMenuItems, footerMenuItems } =
    useFaustQuery(GET_LAYOUT_QUERY) ?? {};

  const { title: siteTitle, description: siteDescription } =
    generalSettings ?? {};
  const primaryMenu = headerMenuItems?.nodes ?? [];
  const footerMenu = footerMenuItems?.nodes ?? [];
  const {
    title,
    content,
    featuredImage,
    date,
    workClient,
    workLink,
    workTypes,
  } = work ?? {};

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
          <Container>
            {workTypes?.nodes?.length > 0 && (
              <p>{workTypes.nodes.map((t) => t.name).join(', ')}</p>
            )}
            {workClient && (
              <p>
                <strong>Client :</strong> {workClient}
              </p>
            )}
            {workLink && (
              <p>
                <a href={workLink} target="_blank" rel="noreferrer">
                  {workLink}
                </a>
              </p>
            )}
            <ContentWrapper content={content} />
          </Container>
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
];
