import { DiegesisUI } from '@eten-lab/ui-kit';
import SidebarNavOptions from '../config/SidebarNavOptions';
const { AboutPage: DiegesisAboutPage, MOCK_PAGE_HEADER_PROPS, MOCK_PAGE_FOOTER_PROPS, MOCK_SIDE_NAV_PROPS } = DiegesisUI;

export default function AboutPage({ setAppLanguage }) {
    const pageProps = {
        headerProps: MOCK_PAGE_HEADER_PROPS,
        footerProps: MOCK_PAGE_FOOTER_PROPS,
        sideNavProps: {...MOCK_SIDE_NAV_PROPS, options: SidebarNavOptions },
    }
    return <>
        <DiegesisAboutPage {...pageProps} />
    </>
}