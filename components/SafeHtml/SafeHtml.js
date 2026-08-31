import { forwardRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const SANITIZE_OPTIONS = {
	USE_PROFILES: { html: true },
	FORBID_TAGS: ['form', 'iframe', 'object', 'embed', 'script', 'style'],
	FORBID_ATTR: ['style'],
};

// forwardRef: page-contact.js attaches a ref here to find/submit the CF7
// form inside the sanitized HTML (see useCf7Submit) — a plain function
// component would silently drop that ref and break the submit handler.
const SafeHtml = forwardRef(function SafeHtml(
	{ as: Tag = 'div', html = '', allowForms = false, ...props },
	ref
) {
	const options = allowForms
		? {
				...SANITIZE_OPTIONS,
				FORBID_TAGS: SANITIZE_OPTIONS.FORBID_TAGS.filter((tag) => tag !== 'form'),
			}
		: SANITIZE_OPTIONS;
	const sanitizedHtml = DOMPurify.sanitize(html, options);

	return <Tag ref={ref} {...props} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
});

export default SafeHtml;
