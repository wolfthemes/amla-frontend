import category from './category';
import tag from './tag';
import frontPage from './front-page';
import page from './page';
import pageAbout from './page-a-propos';
import pageContact from './page-contact';
import pageProjets from './page-projets';
import single from './single';
import singleWork from './single-work';

const templates = {
	category,
	tag,
	'front-page': frontPage,
	page,
	'page-a-propos': pageAbout,
	'page-contact': pageContact,
	'page-projets': pageProjets,
	single,
	'single-work': singleWork,
};

export default templates;
