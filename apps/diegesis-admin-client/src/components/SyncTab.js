import React from 'react';
import {
    gql,
    useQuery,
    useApolloClient,
} from "@apollo/client";

import { Button} from '@mui/material';
import {Add, Upgrade} from '@mui/icons-material';

import EntriesTable from "./EntriesTable";
import { searchQuery } from '../lib/remoteSearch';
import { fetchEntry } from '../lib/tableCallbacks';
import GqlLoading from "./GqlLoading";
import GqlError from "./GqlError";

export default function SyncTab({selectedOrgRecord, searchLang, searchText}) {

    const client = useApolloClient();

    const queryString = searchQuery(
        `query catalogEntries {
            org(name: "%org%") {
                id: name
                fullName
                contentType
                catalogHasRevisions
                canSync
                catalogEntries%searchClause% {
                    id
                    languageCode
                    title
                    isLocal
                    isRevisionLocal
                    revision
                }
            }
        }`,
        selectedOrgRecord.id,
        searchLang,
        searchText,
        true);

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
        {pollInterval: 2000}
    );

    const columns = [
        {id: 'id', label: 'ID', minWidth: 100},
        {id: 'revision', label: 'Revision', minWidth: 50},
        {id: 'languageCode', label: 'Language', minWidth: 50},
        {
            id: 'title',
            label: 'Title',
            minWidth: 200,
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            align: 'right',
        },
    ];

    function createData(catalogEntry, contentType) {
        return {
            id: catalogEntry.id,
            languageCode: catalogEntry.languageCode,
            revision: selectedOrgRecord.catalogHasRevisions ? catalogEntry.revision : "unknown",
            title: catalogEntry.title,
            actions: <Button
                onClick={
                    () => {
                        try {
                            fetchEntry(
                                client,
                                selectedOrgRecord.id,
                                catalogEntry.id,
                                contentType
                            );
                        } catch (err) {
                            console.log("ERROR FROM FETCHENTRY", err.msg);
                        }
                    }
                }
                disabled={catalogEntry.isRevisionLocal}
            >
                {catalogEntry.isLocal ? <Upgrade/> : <Add/>}
            </Button>
        };
    }

    if (loading) {
        return <GqlLoading />
    }
    if (error) {
        return <GqlError error={error} />
    }
    const orgContentType = data?.org.contentType;
    const rows = data.org.catalogEntries.map(ce => createData(ce, orgContentType));
    return <EntriesTable columns={columns} rows={rows}/>;
}
