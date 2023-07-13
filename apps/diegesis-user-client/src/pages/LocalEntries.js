/* eslint-disable react-hooks/exhaustive-deps */
import { Container, IconButton, Paper, Typography } from "@mui/material";
import { Delete } from '@mui/icons-material';
import { useEffect, useRef, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { DiegesisUI } from '@eten-lab/ui-kit';
import PageLayout from "../components/PageLayout";
import { searchQuery } from "../lib/localSearch";
import { deleteEntry } from "../lib/tableCallbacks";
import EntriesFilter from "../components/admin/EntriesFilter";
import GqlLoading from "../components/GqlLoading";
import GqlError from "../components/GqlError";
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
    const gqlQueryClient = useApolloClient();
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] });
    const [gqlQueryParams, setGQLQueryParams] = useState({ org: '', lang: '', term: '' });
    const skipGQLCall = !gqlQueryParams.org;
    const { loading, error, data } = useQuery(gql`${getGQLQuery(gqlQueryParams)}`, { skip: skipGQLCall, pollInterval: 2000 });
    const [paginate, setPaginate] = useState({ page: 0, rowsPerPage: 10 });
    const langOptions = useRef([]);

    useEffect(
        () => {
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
                render(localEntry) {
                    return (
                        <IconButton onClick={() => {
                            deleteEntry(
                                gqlQueryClient,
                                localEntry.org,
                                localEntry.transId,
                                localEntry.revision,
                            )
                        }}>
                            <Delete />
                        </IconButton>
                    );
                },
            }]
            setDataTable({ ...dataTable, cellsConfig });
        }, []);

    useEffect(() => {
        if (!Array.isArray(data?.localEntries)) return;
        const langObj = {}
        const transformedEntries = data.localEntries.map(localEntry => {
            const langCode = localEntry.language;
            if (!langObj[langCode]) {
                langObj[langCode] = ({ id: langCode, title: langCode, langCode: langCode });
            }
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
                    ...localEntry,
                    id: localEntry.transId,
                    orgId: gqlQueryParams.org,
                    revision: localEntry.revision,
                }
            };
        })
        if (langOptions.current.length < 1) {
            langOptions.current = Object.values(langObj);
        }
        setDataTable({ ...dataTable, entries: transformedEntries });
    }, [data])

    const onFilterChange = ({ term, lang, org }) => {
        const newQuery = { ...gqlQueryParams };
        if (typeof term !== 'undefined') newQuery.term = term;
        if (typeof lang !== 'undefined') newQuery.lang = lang;
        if (typeof org !== 'undefined') newQuery.org = org;
        setGQLQueryParams(newQuery);
    }

    const onPageChange = (page, rowsPerPage) => {
        setPaginate({ page, rowsPerPage: rowsPerPage ?? paginate.rowsPerPage });
    }

    const parentPath = url ?? window.location.pathname

    const renderConditionalContent = () => {
        if (loading) return <GqlLoading />
        if (error) return <GqlError error={error} />
        if (dataTable.entries.length) {
            let startIdx = paginate.page * paginate.rowsPerPage;
            let endIdx = startIdx + paginate.rowsPerPage;
            const entries = dataTable.entries.slice(startIdx, endIdx)
            return <EntriesDataTable
                entries={entries}
                cellsConfig={dataTable.cellsConfig}
                parentPath={parentPath}
                pagination={{
                    page: paginate.page,
                    totalRows: dataTable.entries.length,
                    rowsPerPage: paginate.rowsPerPage,
                    onPageChange
                }}
            />
        }
        return <Paper sx={{ width: '100%', overflow: 'hidden', my: 5, py: 5 }}>
            <Typography variant="h5" textAlign={'center'}>
                Entries Not Found For Selected Filters!
            </Typography>
        </Paper>
    }

    return <PageLayout id="local-entries-page" parentPath={parentPath}>
        <Container>
            <EntriesFilter onFilterChange={onFilterChange} parentPath={parentPath} languages={langOptions.current} />
            <br />
            {renderConditionalContent()}
        </Container>
    </PageLayout>
}