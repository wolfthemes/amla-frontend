import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
  Header,
  Footer,
  Main,
  Container,
  NavigationMenu,
  FeaturedImage,
  SEO,
} from '../components';

export default function Component() {
  const { data } = useQuery(Component.query, {
    variables: Component.variables(),
  });

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings ?? {};
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const works = data?.works?.nodes ?? [];

  return (
    <>
      <SEO title={siteTitle} description={siteDescription} />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
      <Main>
        <Container>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {works.map((work) => (
              <li key={work.id} style={{ marginBottom: '3rem' }}>
                <Link href={work.uri}>
                  {work.featuredImage?.node && (
                    <FeaturedImage
                      image={work.featuredImage.node}
                      layout="responsive"
                    />
                  )}
                  <h2>{work.title}</h2>
                </Link>
                {work.workTypes?.nodes?.length > 0 && (
                  <p>{work.workTypes.nodes.map((t) => t.name).join(', ')}</p>
                )}
                <div dangerouslySetInnerHTML={{ __html: work.excerpt }} />
              </li>
            ))}
          </ul>
        </Container>
      </Main>
      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetFrontPage(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    works {
      nodes {
        id
        title
        uri
        excerpt
        workTypes {
          nodes {
            name
          }
        }
        ...FeaturedImageFragment
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
