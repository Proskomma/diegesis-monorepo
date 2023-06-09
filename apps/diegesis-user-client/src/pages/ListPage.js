import React, { useState, useEffect, useRef } from 'react';
import {
    gql,
    useQuery
} from "@apollo/client";
import { searchQuery } from '../lib/search';
import i18n from '../i18n';
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import PageLayout from '../components/PageLayout';
import { useAppContext } from '../contexts/AppContext';
const { FlexibleDesign } = DiegesisUI;
const { FlexibleEntriesListPage } = FlexibleDesign.FlexibleEntriesListUI;
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
            entryEnums {
                languages
                types
                owners
                sources
            }
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

export default function ListPage() {

    const { appLang } = useAppContext();
    const refTagKeyValue = useRef();
    const [selectControls, setSelectControls] = useState([]);
    const [tagConfig, setTagConfig] = useState({});
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] })
    const [gqlQueryParams, setGQLQueryParams] = useState({ ...GQL_DEFAULT_QUERY_PARAMS })
    const { data: entriesData } = useQuery(
        gql`${getGQLQuery(gqlQueryParams)}`,
    );
    const { data: entryEnums } = useQuery(gql`
    query {
        entryEnums {
            languages
            types
            owners
            sources
        }
    }`);

    // runs once, when the page is rendered
    useEffect(() => {
        const initialSelectControlValues = [
            {
                label: i18n(appLang, "CONTROLS_ORGANIZATION"),
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
                render(value, styles = {}) {
                    return (
                        <Button
                            className="no-padding"
                            href={`/entry/details/${value.source}/${value.transId}/${value.revision.replace(/\s/g, "__")}`}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: styles.primaryColor ?? 'text.turquoise-light',
                            }}
                        >
                            {value.title}
                        </Button>
                    );
                },
            }
        ];
        setDataTable({ entries: [], cellsConfig: cellConfig });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!entryEnums?.entryEnums) return
        const clonedControls = [...selectControls]
        const { languages, owners, sources, types } = entryEnums.entryEnums;
        if (sources) {
            clonedControls[0].options = [{ title: i18n(appLang, "CONTROLS_ALL"), id: 'all' }, ...sources.map(s => ({ title: s, id: s }))];
        }
        if (owners) {
            clonedControls[1].options = owners.map(o => ({ title: o, id: o }));
        }
        if (types) {
            clonedControls[2].options = types.map(t => ({ title: t, id: t }));
        }
        if (languages) {
            clonedControls[3].options = languages.map(l => ({ title: l, id: l }));
        }
        setSelectControls(clonedControls);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryEnums?.entryEnums]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectControls, tagConfig]);

    useEffect(() => {
        if (entriesData) {
            const tblEntries = entriesData.localEntries.map(item => ({
                types: item.types?.join(', ') || "?",
                source: `${item.owner}@${item.source}`,
                language: item.language,
                title: item
            }));
            setDataTable({ ...dataTable, entries: tblEntries })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entriesData]);

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
            titleText: i18n(appLang, "LIST_PAGE_ENTRIES"),
            filterTabText: i18n(appLang, "LIST_PAGE_FILTER_TAB"),
            selectControls: selectControls,
            tagConfig: tagConfig,
            searchBoxProps: {
                onSearchBtnClick,
                placeholder: i18n(appLang, "LIST_PAGE_SEARCH_PLACEHOLDER")
            }
        },
        entriesDataTable: dataTable,
        noPageLayout: true
    }

    return (
        <PageLayout>
            <FlexibleEntriesListPage {...pageProps} />
        </PageLayout>
    )
}
