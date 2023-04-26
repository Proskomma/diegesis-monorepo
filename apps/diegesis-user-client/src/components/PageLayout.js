import { useContext } from 'react';
import AppLangResourcesContext from '../contexts/AppLangResourcesContext';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
const { PageLayout: DiegesisPageLayout, MOCK_PAGE_HEADER_PROPS, MOCK_SIDE_NAV_PROPS } = DiegesisUI;

export default function PageLayout(props) {
    const appLangResources = useContext(AppLangResourcesContext);
    const navOptions = appLangResources.urlData && appLangResources.urlData.map(item => ({
        title: item.menuText,
        variant: 'small',
        href: `/${item.url === 'home' ? "" : item.url}`
    }));
    const baseLayoutProps = {
        headerProps: MOCK_PAGE_HEADER_PROPS,
        sideNavProps: { ...MOCK_SIDE_NAV_PROPS, options: navOptions },
        footerProps: {
            markdownContent: <ReactMarkdown>{appLangResources.footer && appLangResources.footer.body}</ReactMarkdown>,
        }
    }
    return (
        <DiegesisPageLayout {...baseLayoutProps}>
            {props.children}
        </DiegesisPageLayout>
    );
}
