import React from 'react';
import {
    gql,
    useQuery,
    useApolloClient,
} from "@apollo/client";

import { Button } from '@mui/material';
import {Download} from '@mui/icons-material';

import EntriesTable from "./EntriesTable";
import { searchQuery } from '../lib/search';
import { fetchEntry } from '../lib/tableCallbacks';
import GqlLoading from "./GqlLoading";
import GqlError from "./GqlError";

export default function RemoteTab({selectedOrg, searchLang, searchText}) {

    const client = useApolloClient();

    const queryString = searchQuery(
        `query catalogEntries {
            org(name: "%org%") {
                id: name
                fullName,
                contentType
                catalogEntries%searchClause% {
                    id
                    languageCode
                    title
                    isLocal
                }
            }
        }`,
        selectedOrg,
        searchLang,
        searchText);

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
        {pollInterval: 2000}
    );

    const columns = [
        {id: 'id', label: 'ID', minWidth: 100},
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
            title: catalogEntry.title,
            actions: <Button
                onClick={
                    () => {
                        try {
                            fetchEntry(
                                client,
                                selectedOrg,
                                catalogEntry.id,
                                contentType
                            );
                        } catch (err) {
                            console.log("ERROR FROM FETCHENTRY", err.msg);
                        }
                    }
                }
                disabled={catalogEntry.isLocal}
            >
                <Download/>
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
    return <EntriesTable columns={columns} rows={rows}/>
}
