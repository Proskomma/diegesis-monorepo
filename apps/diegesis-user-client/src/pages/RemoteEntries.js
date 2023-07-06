/* eslint-disable react-hooks/exhaustive-deps */
import { Container, IconButton, Paper, Typography } from "@mui/material";
import { Add, Update } from '@mui/icons-material';
import { useEffect, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { DiegesisUI } from '@eten-lab/ui-kit';
import PageLayout from "../components/PageLayout";
import { searchQuery } from "../lib/remoteSearch";
import EntriesFilter from "../components/admin/EntriesFilter";
import GqlLoading from "../components/GqlLoading";
import GqlError from "../components/GqlError";
import { fetchEntry } from "../lib/tableCallbacks";
const { EntriesDataTable } = DiegesisUI.FlexibleDesign.FlexibleEntriesListUI;

//#region helper methods
const getGQLQuery = ({ org = '', lang = '', term = '' }) => {
    return searchQuery(
        `query catalogEntries {
            org(name: "%org%") {
                id: name
                fullName
                contentType
                catalogHasRevisions
                canSync
                catalogEntries%searchClause% {
                    source
                    transId
                    languageCode
                    title
                    isLocal
                    isRevisionLocal
                    revision
                }
            }
        }`,
        org,
        lang,
        term
    );
}
//#endregion

export default function RemoteEntries({ url }) {
    const gqlClient = useApolloClient();
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] });
    const [gqlQueryParams, setGQLQueryParams] = useState({ org: '', lang: '', term: '' });
    const skipGQLCall = !gqlQueryParams.org;
    const { loading, error, data } = useQuery(gql`${getGQLQuery(gqlQueryParams)}`, { skip: skipGQLCall });

    useEffect(
        () => {
            const handleEntryAction = (entry) => {
                try {
                    fetchEntry(
                        gqlClient,
                        entry.orgId,
                        entry.transId,
                        entry.contentType,
                        entry.source
                    );
                } catch (err) {
                    console.log("FAILED TO DELETE ENTRY::", err.msg);
                }
            }
            const cellsConfig = [{
                id: 'source',
                numeric: false,
                disablePadding: true,
                label: 'Source',
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
                id: 'languageCode',
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
                id: 'actions',
                numeric: false,
                disablePadding: true,
                label: 'Actions',
                render(entry) {
                    return (
                        <IconButton
                            onClick={() => { handleEntryAction(entry) }}
                            disabled={entry.isRevisionLocal}
                        >
                            {entry.isLocal ? <Update /> : <Add />}
                        </IconButton>
                    );
                },
            }]
            setDataTable({ ...dataTable, cellsConfig });
        }, []);

    useEffect(() => {
        if (!Array.isArray(data?.org?.catalogEntries)) return;
        const contentType = data.org.contentType;
        const transformedEntries = data.org.catalogEntries.map(catalogEntry => {
            return ({
                source: catalogEntry.source || "unknown",
                id: catalogEntry.transId,
                languageCode: catalogEntry.languageCode,
                title: catalogEntry.title,
                contentType,
                actions: {
                    ...catalogEntry,
                    contentType,
                    orgId: gqlQueryParams.org
                }
            })
        })
        setDataTable({ ...dataTable, entries: transformedEntries });
    }, [data])

    const onFilterChange = ({ term, lang, org }) => {
        const newQuery = { ...gqlQueryParams };
        if (typeof term !== 'undefined') {
            newQuery.term = term;
        }
        if (typeof lang !== 'undefined') {
            newQuery.lang = lang;
        }
        if (typeof org !== 'undefined') {
            newQuery.org = org;
        }
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

    return <PageLayout id="remote-entries-page" parentPath={parentPath}>
        <Container>
            <EntriesFilter onFilterChange={onFilterChange} parentPath={parentPath} />
            <br />
            {renderConditionalContent()}
        </Container>
    </PageLayout>
}