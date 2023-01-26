import React from 'react';
import {searchQuery} from '../lib/localSearch';
import EntriesTable from "./EntriesTable";
import {gql, useQuery, useApolloClient, InMemoryCache} from "@apollo/client";
import GqlLoading from "./GqlLoading";
import GqlError from "./GqlError";
import {deleteEntry} from '../lib/tableCallbacks';
import {Button} from '@mui/material';
import {Delete} from '@mui/icons-material';

export default function LocalTab({selectedOrg, searchLang, searchText}) {

    const client = useApolloClient();

    const queryString = searchQuery(
        `query {
            localEntries%searchClause% {
                source
                transId
                revision
                language
                owner
                title
                usfmBookCodes: bookCodes(type:"usfm")
                usxBookCodes: bookCodes(type: "usx")
                succinctRecord: canonResource(type:"succinct") {type}
                hasSuccinctError
                vrsRecord: canonResource(type:"versification") {type}
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
        let succinctState = localEntry.succinctRecord ? 'yes' : 'no';
        if (localEntry.hasSuccinctError) {
            succinctState = 'FAIL';
        }
        return {
            id: localEntry.transId,
            languageCode: localEntry.language,
            title: localEntry.title,
            owner: localEntry.owner,
            revision: localEntry.revision,
            hasSuccinct: succinctState,
            hasVrs: localEntry.vrsRecord,
            actions: <Button
                onClick={
                    () => deleteEntry(
                        client,
                        selectedOrg,
                        localEntry.transId,
                        localEntry.revision,
                    )
                }
            >
                <Delete/>
            </Button>
        };
    }

    if (loading) {
        return <GqlLoading/>
    }
    if (error) {
        return <GqlError error={error}/>
    }
    const rows = data.localEntries.map(lt => createData(lt));
    return <EntriesTable columns={columns} rows={rows}/>

}
