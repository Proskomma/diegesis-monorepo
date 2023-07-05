/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, IconButton } from "@mui/material";
import { DeleteOutlineOutlined } from '@mui/icons-material';
import i18n from '../i18n';
import { useEffect, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { DiegesisUI } from '@eten-lab/ui-kit';
import langTable from "../i18n/languages.json";
import PageLayout from "../components/PageLayout";
import { useAppContext } from "../contexts/AppContext";
import { searchQuery } from "../lib/localSearch";
const { FlexibleSelectControl, FlexibleSearchBox } = DiegesisUI.FlexibleDesign;
const { EntriesDataTable } = DiegesisUI.FlexibleDesign.FlexibleEntriesListUI;

//#region helper methods
const getGQLQuery = ({ org = '', lang = '', term = '' }) => {
    return searchQuery(
        `query {
            localEntries%searchClause% {
                source
                transId
                revision
                language
                owner
                title
                succinctRecord: canonResource(type:"succinct") {type}
                hasSuccinctError
                vrsRecord: canonResource(type:"versification") {type}
            }
        }`,
        org,
        lang,
        term
    );
}
//#endregion

export default function LocalEntries({ url }) {
    const { appLang, clientStructure } = useAppContext();
    const gqlClient = useApolloClient();
    const [orgDropdown, setOrgDropdown] = useState({ options: [], value: '' });
    const [langDropdown, setLangDropdown] = useState({ options: [], value: '' });
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] });
    const [gqlQueryParams, setGQLQueryParams] = useState({ org: '', lang: '', term: '' });
    const { loading, error, data } = useQuery(gql`${getGQLQuery(gqlQueryParams)}`);

    useEffect(
        () => {
            const doOrgs = async () => {
                const result = await gqlClient.query({
                    query: gql`{
                      orgs {
                        id: name
                        canSync
                        catalogHasRevisions
                      }
                    }`
                });
                const dropdownOptions = result.data.orgs.map(o => ({ id: o.id, title: o.id }));
                setOrgDropdown({ options: dropdownOptions, value: dropdownOptions[0]?.id });
            };
            doOrgs();

            const cellsConfig = [{
                id: 'owner',
                numeric: false,
                disablePadding: true,
                label: 'Owner',
            },
            {
                id: 'id',
                numeric: false,
                disablePadding: false,
                label: 'ID',
            },
            {
                id: 'revision',
                numeric: false,
                disablePadding: false,
                label: 'Revision',
            },
            {
                id: 'language',
                numeric: false,
                disablePadding: false,
                label: 'Language',
            },
            {
                id: 'title',
                numeric: false,
                disablePadding: false,
                label: 'Title',
            },
            {
                id: 'hasSuccinct',
                numeric: false,
                disablePadding: false,
                label: 'Succinct?',
            },
            {
                id: 'actions',
                numeric: false,
                disablePadding: true,
                label: 'Actions',
                render() {
                    return (
                        <IconButton>
                            <DeleteOutlineOutlined />
                        </IconButton>
                    );
                },
            }]
            setDataTable({ ...dataTable, cellsConfig });
        }, []);

    useEffect(() => {
        const langOptions = Object.entries(langTable)
            .filter(kv => (clientStructure?.languages?.includes(kv[0])) || kv[0] === "en")
            .map((kv, n) => ({ title: kv[1].autonym, id: kv[1].autonym }));
        setLangDropdown({ ...langDropdown, options: [{ id: '', title: '' }, ...langOptions], value: '' });
    }, [clientStructure?.languages])

    useEffect(() => {
        setGQLQueryParams({ ...gqlQueryParams, org: orgDropdown.value });
    }, [orgDropdown.value, langDropdown.value])

    useEffect(() => {
        if (!Array.isArray(data?.localEntries)) return;
        const transformedEntries = data.localEntries.map(localEntry => {
            let succinctState = localEntry.succinctRecord ? 'yes' : 'no';
            if (localEntry.hasSuccinctError) {
                succinctState = 'FAIL';
            }
            return {
                id: localEntry.transId,
                language: localEntry.language,
                title: localEntry.title,
                owner: localEntry.owner,
                revision: localEntry.revision,
                hasSuccinct: succinctState,
                hasVrs: localEntry.vrsRecord,
                actions: {
                    org: orgDropdown.value,
                    id: localEntry.transId,
                    revision: localEntry.revision,
                }
            };
        })
        setDataTable({ ...dataTable, entries: transformedEntries });
    }, [data])

    const onOrgChange = (value) => {
        setOrgDropdown({ ...orgDropdown, value });
    }

    const onLangChange = (value) => {
        setLangDropdown({ ...langDropdown, value });
    }

    const onSearchBtnClick = (value) => {
        setGQLQueryParams((prevState) => {
            return ({ ...prevState, term: value })
        })
    }

    const parentPath = url ?? window.location.pathname
    return <PageLayout id="local-entries-page" parentPath={parentPath}>
        <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ minWidth: '175px' }}>
                    <FlexibleSelectControl
                        id={"local-entries-org"}
                        parentPath={parentPath}
                        label={'ORG'}
                        options={orgDropdown.options}
                        value={orgDropdown.value}
                        onChange={onOrgChange}
                    />
                </Box>
                <Box sx={{ minWidth: '175px' }}>
                    <FlexibleSelectControl
                        id={"local-entries-lang"}
                        parentPath={parentPath}
                        label={'Language'}
                        options={langDropdown.options}
                        value={langDropdown.value}
                        onChange={onLangChange}
                    />
                </Box>
                <Box>
                    <FlexibleSearchBox
                        id={"local-entries-search"}
                        parentPath={parentPath}
                        placeholder={i18n(appLang, "SEARCH_PLACEHOLDER")}
                        onSearchBtnClick={onSearchBtnClick}
                    />
                </Box>
            </Box>
            <EntriesDataTable {...dataTable} />
        </Container>
    </PageLayout>
}