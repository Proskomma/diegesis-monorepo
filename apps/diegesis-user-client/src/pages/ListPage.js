import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    gql,
    useApolloClient,
    useQuery
} from "@apollo/client";
import { searchQuery } from '../lib/search';
import AppLangContext from "../contexts/AppLangContext";
import i18n from '../i18n';
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import AppLangResourcesContext from '../contexts/AppLangResourcesContext';
const { EntriesPage, MOCK_PAGE_FOOTER_PROPS, MOCK_PAGE_HEADER_PROPS, MOCK_SIDE_NAV_PROPS, MOCK_ENTRIES_TOP_CONTROLS_PROPS } = DiegesisUI;
const { Button } = MuiMaterial;

//#region data
const DEFAULT_TAG_VALUES = {
    introductions: false,
    headings: false,
    footnotes: false,
    xrefs: false,
    strong: false,
    lemma: false,
    gloss: false,
    content: false,
    occurrences: false
}
const GQL_DEFAULT_QUERY_PARAMS = {
    org: 'all',
    owner: '',
    resourceType: '',
    lang: '',
    text: '',
    features: DEFAULT_TAG_VALUES,
    sortField: 'title',
    sortDirection: 'a-z'
}
//#endregion

//#region helper methods
const getGQLQuery = (searchTerms = {}) => {
    return searchQuery(
        `query {
            localEntries%searchClause% {
                source
                types
                transId
                language
                owner
                revision
                title
            }
        }`,
        searchTerms
    )
}
//#endregion

export default function ListPage({ setAppLanguage }) {

    const appLang = useContext(AppLangContext);
    const client = useApolloClient();
    const refTagKeyValue = useRef();
    const [selectControls, setSelectControls] = useState([]);
    const [tagConfig, setTagConfig] = useState({});
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] })
    const [gqlQueryParams, setGQLQueryParams] = useState({ ...GQL_DEFAULT_QUERY_PARAMS })
    const { loading, error, data: entriesList } = useQuery(
        gql`${getGQLQuery(gqlQueryParams)}`,
    );
    const appLangResources = useContext(AppLangResourcesContext);
    const navOptions = appLangResources.urlData && appLangResources.urlData.map(item => ({
        title: item.menuText,
        variant: 'small',
        href: `/${item.url === 'home' ? "" : item.url}`
    }));

    // runs once, when the page is rendered
    useEffect(() => {
        const initialSelectControlValues = [
            {
                label: 'Organization',
                value: 'all',
                options: [],
                onChange: (value) => { onSelectControlValueChange(value, 0) }
            },
            {
                label: i18n(appLang, "CONTROLS_OWNER"),
                value: '',
                options: [],
                onChange: (value) => { onSelectControlValueChange(value, 1) }
            },
            {
                label: i18n(appLang, "CONTROLS_TYPE"),
                value: '',
                options: [],
                onChange: (value) => { onSelectControlValueChange(value, 2) }
            },
            {
                label: i18n(appLang, "CONTROLS_LANGUAGE"),
                value: '',
                options: [],
                onChange: (value) => { onSelectControlValueChange(value, 3) }
            }
        ]
        setSelectControls(initialSelectControlValues);
        refTagKeyValue.current = Object.fromEntries([
            [i18n(appLang, "CONTROLS_OT"), "OT"],
            [i18n(appLang, "CONTROLS_NT"), "NT"],
            [i18n(appLang, "CONTROLS_DC"), "DC"],
            [i18n(appLang, "STATS_nIntroductions"), "introductions"],
            [i18n(appLang, "STATS_nHeadings"), "headings"],
            [i18n(appLang, "STATS_nFootnotes"), "footnotes"],
            [i18n(appLang, "STATS_nXrefs"), "xrefs"],
            [i18n(appLang, "STATS_nStrong"), "strong"],
            [i18n(appLang, "CONTROLS_LEMME"), "lemma"],
            [i18n(appLang, "CONTROLS_GLOSS"), "gloss"],
            [i18n(appLang, "STATS_nContent"), "content"],
            [i18n(appLang, "STATS_nOccurrences"), "occurrences"],
        ]);

        const initialTagConfig = {
            ...MOCK_ENTRIES_TOP_CONTROLS_PROPS.tagConfig,
            tags: Object.keys(refTagKeyValue.current),
            selectedTags: [],
            onTagSelect: onTagSelect,
        }
        setTagConfig(initialTagConfig);

        const cellConfig = [
            {
                id: 'types',
                numeric: false,
                disablePadding: true,
                label: i18n(appLang, "RESOURCE_TYPES"),
            },
            {
                id: 'source',
                numeric: false,
                disablePadding: false,
                label: i18n(appLang, "CONTROLS_SOURCE"),
            },
            {
                id: 'language',
                numeric: false,
                disablePadding: false,
                label: i18n(appLang, "CONTROLS_LANGUAGE"),
            },
            {
                id: 'title',
                numeric: false,
                disablePadding: true,
                label: i18n(appLang, "CONTROLS_TITLE"),
                render(value) {
                    return (
                        <Button
                            className="no-padding"
                            href={`/entry/details/${value.source}/${value.transId}/${value.revision.replace(/\s/g, "__")}`}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'text.turquoise-light',
                            }}
                        >
                            {value.title}
                        </Button>
                    );
                },
            }
        ];
        setDataTable({ entries: [], cellsConfig: cellConfig });

        const doOrgs = async () => {
            const result = await client.query({ query: gql`{ orgs { id: name } }` });
            const clonedControls = [...initialSelectControlValues]
            const ids = (result.data.orgs.map(o => o.id))
            clonedControls[0].options = [{ title: i18n(appLang, "CONTROLS_ALL"), id: 'all' }, ...ids.map(org => ({ title: org, id: org }))]
            setSelectControls(clonedControls);
        };
        doOrgs();
    }, []);

    useEffect(() => {
        if (selectControls && tagConfig) {
            const clonedGQLParams = { ...gqlQueryParams }
            clonedGQLParams.features = { ...DEFAULT_TAG_VALUES };
            (tagConfig.selectedTags || []).forEach((tag) => {
                clonedGQLParams.features[refTagKeyValue.current[tag]] = true;
            })
            clonedGQLParams.org = selectControls?.[0]?.value || '';
            clonedGQLParams.owner = selectControls?.[1]?.value || '';
            clonedGQLParams.resourceType = selectControls?.[2]?.value || '';
            clonedGQLParams.lang = selectControls?.[3]?.value || '';
            setGQLQueryParams(clonedGQLParams);
        }
    }, [selectControls, tagConfig]);

    useEffect(() => {
        if (entriesList) {
            const tblEntries = entriesList.localEntries.map(item => ({
                types: item.types?.join(', ') || "?",
                source: `${item.owner}@${item.source}`,
                language: item.language,
                title: item
            }));
            setDataTable({ ...dataTable, entries: tblEntries })
        }
    }, [entriesList]);

    //#region events
    const onSelectControlValueChange = (value, controlIdx) => {
        setSelectControls((prevControls) => {
            const clonedControls = [...prevControls]
            clonedControls[controlIdx].value = value
            return clonedControls
        })
    }
    const onTagSelect = (idx) => {
        setTagConfig((prevState) => {
            const clonedSelectedTags = [...prevState.selectedTags];
            const tag = prevState.tags[idx]
            const tagIdx = clonedSelectedTags.findIndex(st => st === tag)
            if (tagIdx > -1) {
                clonedSelectedTags.splice(tagIdx, 1)
            } else {
                clonedSelectedTags.push(tag)
            }
            return ({ ...prevState, selectedTags: clonedSelectedTags })
        })
    }
    const onSearchBtnClick = (value) => {
        setGQLQueryParams((prevState) => {
            return ({ ...prevState, text: value })
        })
    }
    //#endregion

    const pageProps = {
        topControlProps: {
            ...MOCK_ENTRIES_TOP_CONTROLS_PROPS,
            titleText: i18n(appLang, "LIST_PAGE_ENTRIES"),
            selectControls: selectControls,
            tagConfig: tagConfig,
            searchBoxProps: {
                onSearchBtnClick,
                placeholder: 'Bible in Basic English'
            }
        },
        headerProps: MOCK_PAGE_HEADER_PROPS,
        footerProps: MOCK_PAGE_FOOTER_PROPS,
        sideNavProps: { ...MOCK_SIDE_NAV_PROPS, options: navOptions },
        entriesDataTable: dataTable,
        noPageLayout: true
    }

    return (
        <EntriesPage {...pageProps} />
    )
}
