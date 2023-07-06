/* eslint-disable react-hooks/exhaustive-deps */
import { Container, IconButton, Paper, Typography } from "@mui/material";
import { Delete } from '@mui/icons-material';
import { useEffect, useState } from "react";
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
    const { loading, error, data } = useQuery(gql`${getGQLQuery(gqlQueryParams)}`);

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
                    ...localEntry,
                    id: localEntry.transId,
                    orgId: gqlQueryParams.org,
                    revision: localEntry.revision,
                }
            };
        })
        setDataTable({ ...dataTable, entries: transformedEntries });
    }, [data])

    const onFilterChange = ({ term, lang, org }) => {
        const newQuery = { ...gqlQueryParams };
        if (typeof term !== 'undefined') newQuery.term = term;
        if (typeof lang !== 'undefined') newQuery.lang = lang;
        if (typeof org !== 'undefined') newQuery.org = org;
        setGQLQueryParams(newQuery);
    }

    const parentPath = url ?? window.location.pathname

    const renderConditionalContent = () => {
        if (loading) return <GqlLoading />
        if (error) return <GqlError error={error} />
        if (dataTable.entries.length) return <EntriesDataTable {...dataTable} />
        return <Paper sx={{ width: '100%', overflow: 'hidden', my: 5, py: 5 }}>
            <Typography variant="h5" textAlign={'center'}>
                Entries Not Found For Selected Filters!
            </Typography>
        </Paper>
    }

    return <PageLayout id="local-entries-page" parentPath={parentPath}>
        <Container>
            <EntriesFilter onFilterChange={onFilterChange} parentPath={parentPath} />
            <br />
            {renderConditionalContent()}
        </Container>
    </PageLayout>
}