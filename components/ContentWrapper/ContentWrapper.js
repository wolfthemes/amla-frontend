import className from 'classnames/bind';
import styles from './ContentWrapper.module.scss';
import SafeHtml from '../SafeHtml/SafeHtml';

let cx = className.bind(styles);

export default function ContentWrapper({ content, children, className, dense }) {
	return (
		<article className={cx(['component', dense && 'dense', className])}>
			<SafeHtml html={content} />
			{children}
		</article>
	);
}
