import { useEffect, useRef } from 'react';
import { gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import classNames from 'classnames/bind';
import { Header, Footer, Main, NavigationMenu, SEO } from '../components';
import styles from './page-contact.module.scss';

let cx = classNames.bind(styles);

// The CF7 shortcode's own submit JS assumes it's running on a normal WP
// page (ajaxurl, its enqueued script) — neither exists here, so a plain
// click falls through to the form's native `action` (a WP admin URL) and
// navigates away. Submit it ourselves instead, straight to CF7's REST
// feedback endpoint (built into the plugin, no extra WPGraphQL plugin
// needed) and mirror its own response handling: fill in
// .wpcf7-response-output and drop a .wpcf7-not-valid-tip beside each
// invalid field, same as CF7's own script would.
function useCf7Submit(wrapperRef, deps) {
	useEffect(() => {
		const form = wrapperRef.current?.querySelector('.wpcf7-form');
		const wpcf7Id = form?.closest('[data-wpcf7-id]')?.dataset.wpcf7Id;
		if (!form || !wpcf7Id) return;

		const responseOutput = form.querySelector('.wpcf7-response-output');
		const submitButton = form.querySelector('.wpcf7-submit');

		const onSubmit = async (e) => {
			e.preventDefault();
			submitButton?.setAttribute('disabled', 'disabled');
			form.querySelectorAll('.wpcf7-not-valid-tip').forEach((el) => el.remove());

			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/contact-form-7/v1/contact-forms/${wpcf7Id}/feedback`,
					{ method: 'POST', body: new FormData(form) }
				);
				const data = await res.json();

				form.dataset.status = data.status;
				if (responseOutput) responseOutput.textContent = data.message;

				(data.invalid_fields ?? []).forEach(({ into, message }) => {
					const tip = document.createElement('span');
					tip.className = 'wpcf7-not-valid-tip';
					tip.textContent = message;
					form.querySelector(into)?.appendChild(tip);
				});

				if (data.status === 'mail_sent') form.reset();
			} catch {
				if (responseOutput) {
					responseOutput.textContent = 'Une erreur est survenue, veuillez réessayer.';
				}
			} finally {
				submitButton?.removeAttribute('disabled');
			}
		};

		form.addEventListener('submit', onSubmit);
		return () => form.removeEventListener('submit', onSubmit);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}

export default function Component(props) {
	const wrapperRef = useRef(null);
	const content = props?.data?.page?.content;

	useCf7Submit(wrapperRef, [content]);

	if (props.loading) {
		return <>Chargement...</>;
	}

	const { title: siteTitle, description: siteDescription } = props?.data?.generalSettings;
	const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
	const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
	const { title } = props?.data?.page ?? { title: '' };

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
				<div
					ref={wrapperRef}
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
