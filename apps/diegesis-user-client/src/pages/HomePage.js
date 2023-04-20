import { DiegesisUI } from '@eten-lab/ui-kit/dist';
import SidebarNavOptions from '../config/SidebarNavOptions';
const { HomePage: DiegesisHomePage,
  MOCK_PAGE_HEADER_PROPS,
  MOCK_LANDING_PROPS,
  MOCK_PAGE_FOOTER_PROPS,
  MOCK_ABOUT_DIEGESIS_PROPS,
  MOCK_SIDE_NAV_PROPS,
  MOCK_STAT_SECTION_PROPS
} = DiegesisUI;

export default function HomePage() {
  const homePageProps = {
    headerProps: MOCK_PAGE_HEADER_PROPS,
    landingSectionProps: { ...MOCK_LANDING_PROPS, actionBtnHref: '/list' },
    footerProps: MOCK_PAGE_FOOTER_PROPS,
    aboutDiegesisProps: MOCK_ABOUT_DIEGESIS_PROPS,
    sideNavProps: {...MOCK_SIDE_NAV_PROPS, options: SidebarNavOptions },
    statSectionProps: MOCK_STAT_SECTION_PROPS,
  };
  return (
    <DiegesisHomePage {...homePageProps} />
  );
}
