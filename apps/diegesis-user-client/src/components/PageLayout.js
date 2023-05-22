import { useContext } from 'react';
import AppLangResourcesContext from '../contexts/AppLangResourcesContext';
import { DiegesisUI } from '@eten-lab/ui-kit';
const { MOCK_SIDE_NAV_PROPS, FlexibleDesign } = DiegesisUI;
const { FlexiblePageLayout } = FlexibleDesign;

export default function PageLayout(props) {
    const appLangResources = useContext(AppLangResourcesContext);
    const navOptions = appLangResources.urlData && appLangResources.urlData.map(item => ({
        title: item.menuText,
        variant: 'small',
        href: `/${item.url === 'home' ? "" : item.url}`
    }));
    const pageProps = {
        sideNavProps: { ...MOCK_SIDE_NAV_PROPS, options: navOptions },
    }
    return (
        <FlexiblePageLayout sideNavProps={pageProps.sideNavProps}>
            {props.children}
        </FlexiblePageLayout>
    );
}
