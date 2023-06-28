import { useAppContext } from "../contexts/AppContext";
import { DiegesisUI, MuiMaterial, Checkbox } from '@eten-lab/ui-kit';
import { useLocation } from 'react-router-dom';
import i18n from '../i18n';
import langTable from "../i18n/languages.json";
const { Button, FormGroup, FormControlLabel } = MuiMaterial;
const { MOCK_SIDE_NAV_PROPS, FlexibleDesign } = DiegesisUI;
const { FlexiblePageLayout } = FlexibleDesign;

const LangSelector = () => {
    const { appLang, mutateState, setStoreConfig, clientStructure } = useAppContext();
    return (
        <>
            <Button
                variant={'text'}
                color={'dark'}
                size={'medium'}
                disabled
                sx={{
                    textTransform: 'none',
                    fontSize: '1.25rem',
                    textAlign: 'left',
                    lineHeight: '1.25rem',
                    fontWeight: 400,
                    padding: '1rem 0px',
                    width: '100%',
                    display: 'block',
                    size: 'medium',
                }}
            >
                {i18n(appLang, 'SITE_LANGUAGE')}
            </Button>
            <FormGroup>
                {
                    Object.entries(langTable)
                        .filter(kv => (clientStructure?.languages?.includes(kv[0])) || kv[0] === "en")
                        .map((kv, n) =>
                            <FormControlLabel
                                key={n}
                                control={
                                    <Checkbox
                                        key={n}
                                        value={kv[0]}
                                        aria-label={kv[1].autonym}
                                        name='lang'
                                        checked={appLang === kv[0]}
                                        onChange={() => {
                                            if (mutateState) {
                                                mutateState({ appLang: kv[0] });
                                                setStoreConfig({ langCode: kv[0] });
                                            }
                                        }}
                                    />
                                }
                                label={kv[1].autonym}
                            />
                        )
                }
            </FormGroup>
        </>
    )
}

export default function PageLayout(props) {
    const { authLoaded, authed, doLogout, clientStructure, appLang } = useAppContext();
    const location = useLocation();
    const navOptions = clientStructure?.urlData?.map(item => {
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
                    title: 'Admin',
                    variant: 'category',
                    options: [
                        { title: `- ${i18n(appLang, 'UI')}`, href: '/ui-config', variant: 'small' },
                        { title: `- ${i18n(appLang, 'STATIC_PAGES')}`, href: '/static-ui-config', variant: 'small' },
                        {
                            title: `- ${i18n(appLang, 'LOGOUT')}`, href: '/', variant: 'small', onClick: () => {
                                doLogout();
                            }
                        },
                    ],
                });
            } else {
                navOptions.push({
                    title: `- ${i18n(appLang, 'LOGIN')}`,
                    variant: 'bordered',
                    href: '/login',
                    activated: location.pathname === '/login'
                });
            }
        }
        navOptions.push({
            variant: 'custom',
            element: <LangSelector />
        });
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