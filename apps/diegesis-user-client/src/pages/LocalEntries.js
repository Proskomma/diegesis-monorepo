/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, IconButton } from "@mui/material";
import { DeleteOutlineOutlined } from '@mui/icons-material';
import i18n from '../i18n';
import { useEffect, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import PageLayout from "../components/PageLayout";
import { DiegesisUI } from '@eten-lab/ui-kit';
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
    const { appLang } = useAppContext();
    const gqlClient = useApolloClient();
    const [orgDropdown, setOrgDropdown] = useState({ options: [], curOrg: '' });
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] });
    const [gqlQueryParams, setGQLQueryParams] = useState({ org: '', lang: '', term: '' });
    const { loading, error, data: orgLocalEntries } = useQuery(
        gql`${getGQLQuery(gqlQueryParams)}`,
        // { pollInterval: 2000 }
    );

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
                setOrgDropdown({ options: dropdownOptions, curOrg: dropdownOptions[0]?.id });
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
        if (!Array.isArray(orgLocalEntries)) return;
        const transformedEntries = orgLocalEntries.map(localEntry => {
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
                    org: orgDropdown.curOrg,
                    id: localEntry.transId,
                    revision: localEntry.revision,
                }
            };
        })
        console.log('prev datatable', dataTable)
        setDataTable({ ...dataTable, entries: transformedEntries });
    }, [orgLocalEntries])

    const onOrgChange = (value) => {
        setOrgDropdown((prevState) => {
            return ({ ...prevState, curOrg: value });
        })
        setGQLQueryParams((prevState) => {
            return ({ ...prevState, org: value });
        })
    }

    const onSearchBtnClick = (value) => {
        setGQLQueryParams((prevState) => {
            return ({ ...prevState, term: value })
        })
    }

    const parentPath = url ?? window.location.pathname
    return <PageLayout id="local-entries-page" parentPath={parentPath}>
        <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Box sx={{ minWidth: '275px' }}>
                    <FlexibleSelectControl
                        id={"local-entries-select-control"}
                        parentPath={parentPath}
                        label={'ORG'}
                        options={orgDropdown.options}
                        value={orgDropdown.value}
                        onChange={onOrgChange}
                    />
                </Box>
                <Box>
                    <FlexibleSearchBox
                        id={"local-entries-select-control"}
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