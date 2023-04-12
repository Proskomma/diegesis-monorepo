import React, { useState, useEffect, useContext } from 'react';
import {
    gql,
    useApolloClient,
    useQuery
} from "@apollo/client";
import AppLangContext from "../contexts/AppLangContext";
import i18n from '../i18n';
import { DiegesisUI } from '@eten-lab/ui-kit';
const { EntriesPage, MOCK_PAGE_FOOTER_PROPS, MOCK_ENTRIES_DATA_TABLE_PROPS, MOCK_PAGE_HEADER_PROPS, MOCK_SIDE_NAV_PROPS, MOCK_ENTRIES_TOP_CONTROLS_PROPS } = DiegesisUI;


//#region helper methods
const getGQLQuery = (searchTerms = {}) => {
    return `query {
            localEntries {
                source
                types
                transId
                language
                owner
                revision
                title
            }
        }`
}
//#endregion


export default function ListPage({ setAppLanguage }) {

    const appLang = useContext(AppLangContext);
    const [selectControls, setSelectControls] = useState([])
    const [tagConfig, setTagConfig] = useState({})
    const [dataTable, setDataTable] = useState({
        ...MOCK_ENTRIES_DATA_TABLE_PROPS
    })
    const [gqlQuery, setGQLQuery] = useState(getGQLQuery({}))
    const { loading, error, data: entriesList } = useQuery(
        gql`${gqlQuery}`,
    );

    const client = useApolloClient();

    // runs once, when the page is rendered
    useEffect(() => {
        const initialSelectControlValues = [
            {
                label: i18n(appLang, "CONTROLS_TITLE"),
                value: '',
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

        const initialTagConfig = {
            ...MOCK_ENTRIES_TOP_CONTROLS_PROPS.tagConfig,
            tags: [
                i18n(appLang, "CONTROLS_OT"),
                i18n(appLang, "CONTROLS_NT"),
                i18n(appLang, "CONTROLS_DC"),
                i18n(appLang, "STATS_nIntroductions"),
                i18n(appLang, "STATS_nHeadings"),
                i18n(appLang, "STATS_nFootnotes"),
                i18n(appLang, "STATS_nXrefs"),
                i18n(appLang, "STATS_nStrong"),
                i18n(appLang, "CONTROLS_LEMME"),
                i18n(appLang, "CONTROLS_GLOSS"),
                i18n(appLang, "STATS_nContent"),
                i18n(appLang, "STATS_nOccurrences"),
            ],
            selectedTags: [],
            onTagSelect: onTagSelect,
        }
        setTagConfig(initialTagConfig);

        const doOrgs = async () => {
            const result = await client.query({ query: gql`{ orgs { id: name } }` });
            const clonedControls = [...initialSelectControlValues]
            const ids = (result.data.orgs.map(o => o.id))
            clonedControls[0].options = ids.map(org => ({ title: org, id: org })) || []
            setSelectControls(clonedControls);
        };
        doOrgs();
    }, []);

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
    //#endregion


    const entriesPageProps = {
        topControlProps: {
            ...MOCK_ENTRIES_TOP_CONTROLS_PROPS,
            titleText: i18n(appLang, "LIST_PAGE_ENTRIES"),
            selectControls: selectControls,
            tagConfig: tagConfig
        },
        headerProps: MOCK_PAGE_HEADER_PROPS,
        footerProps: MOCK_PAGE_FOOTER_PROPS,
        sideNavProps: MOCK_SIDE_NAV_PROPS,
        entriesDataTable: dataTable,
    }

    return (
        <>
            <EntriesPage {...entriesPageProps} />
        </>
    )
}
