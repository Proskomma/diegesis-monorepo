import { DiegesisUI } from '@eten-lab/ui-kit/dist';
import PageLayout from '../components/PageLayout';
const { LandingSection, StatSection, AboutDiegesisSection,
  MOCK_LANDING_PROPS,
  MOCK_ABOUT_DIEGESIS_PROPS,
  MOCK_STAT_SECTION_PROPS
} = DiegesisUI;

export default function HomePage() {
  const props = {
    landingSectionProps: { ...MOCK_LANDING_PROPS, actionBtnHref: '/list' },
    aboutDiegesisProps: MOCK_ABOUT_DIEGESIS_PROPS,
    statSectionProps: MOCK_STAT_SECTION_PROPS,
  };
  return (
    <PageLayout>
      <LandingSection {...props.landingSectionProps} />
      <StatSection {...(props.statSectionProps || { stats: [] })} />
      <AboutDiegesisSection {...props.aboutDiegesisProps} />
    </PageLayout>
  );
}
