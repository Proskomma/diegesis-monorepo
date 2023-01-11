import React from 'react';
import { searchQuery } from '../lib/search';
import EntriesTable from "./EntriesTable";
import {gql, useQuery,useApolloClient,} from "@apollo/client";
import GqlLoading from "./GqlLoading";
import GqlError from "./GqlError";
import { deleteEntry } from '../lib/tableCallbacks';
import { Button } from '@mui/material';
import {Delete} from '@mui/icons-material';

export default function LocalTab({selectedOrg, searchLang, searchText}) {

    const client = useApolloClient();

    const queryString = searchQuery(
        `query {
        org(name: "%org%") {
            id: name
            localEntries%searchClause% {
                id
                revision
                languageCode
                owner
                title
                hasUsfm
                hasUsx
                hasSuccinct
                hasSuccinctError
                hasVrs
            }
        }
    }`,
        selectedOrg,
        searchLang,
        searchText
    );

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
        {pollInterval: 2000}
    );

    const columns = [
        {
            id: 'owner',
            label: 'Owner',
            minWidth: 100,
        },
        {id: 'id', label: 'ID', minWidth: 100},
        {
            id: 'revision',
            label: 'Revision',
            minWidth: 100,
        },
        {id: 'languageCode', label: 'Language', minWidth: 50},
        {
            id: 'title',
            label: 'Title',
            minWidth: 200,
        },
        {
            id: 'hasSuccinct',
            label: 'Succinct?',
            minWidth: 50,
            align: 'right',
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            align: 'right',
        },
    ];

    const createData = localEntry => {
        let succinctState = localEntry.hasSuccinct ? 'yes' : 'no';
        if (localEntry.hasSuccinctError) {
            succinctState = 'FAIL';
        }
        return {
            id: localEntry.id,
            languageCode: localEntry.languageCode,
            title: localEntry.title,
            owner: localEntry.owner,
            revision: localEntry.revision,
            hasSuccinct: succinctState,
            hasVrs: localEntry.hasVrs,
            actions: <Button
                onClick={
                    () => deleteEntry(
                        client,
                        selectedOrg,
                        localEntry.id,
                        localEntry.revision,
                    )
                }
            >
                <Delete/>
            </Button>
        };
    }

    if (loading) {
        return <GqlLoading />
    }
    if (error) {
        return <GqlError error={error} />
    }
    const rows = data.org.localEntries.map(lt => createData(lt));
    return <EntriesTable columns={columns} rows={rows}/>

}
