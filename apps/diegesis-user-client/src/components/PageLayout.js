import { useContext } from 'react';
import { useAppContext } from "../contexts/AppContext";
import AppLangResourcesContext from '../contexts/AppLangResourcesContext';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { useLocation } from 'react-router-dom';
const { MOCK_SIDE_NAV_PROPS, FlexibleDesign } = DiegesisUI;
const { FlexiblePageLayout } = FlexibleDesign;

export default function PageLayout(props) {
    const appLangResources = useContext(AppLangResourcesContext);
    const { authLoaded, authed, doLogout } = useAppContext();
    const location = useLocation();
    const navOptions = appLangResources.urlData && appLangResources.urlData.map(item => {
        const href = `/${item.url === 'home' ? "" : item.url}`;
        return ({
            title: item.menuText,
            variant: 'small',
            href,
            activated: href === location.pathname
        })
    });

    if (Array.isArray(navOptions)) {
        if (authLoaded) {
            if (authed) {
                navOptions.push({
                    title: 'Logout', variant: 'small', href: '/', onClick: () => {
                        doLogout();
                    }
                })
            } else {
                navOptions.push({ title: 'Login', variant: 'small', href: '/login', activated: location.pathname === '/login' });
            }
        }
    }

    const pageProps = {
        sideNavProps: { ...MOCK_SIDE_NAV_PROPS, options: navOptions },
    }
    return (
        <FlexiblePageLayout sideNavProps={pageProps.sideNavProps}>
            {props.children}
        </FlexiblePageLayout>
    );
}
