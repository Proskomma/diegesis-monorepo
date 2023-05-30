/* eslint-disable react-hooks/exhaustive-deps */
import {
    Paper,
    Box,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "../components/admin/Header";
import TabbedBody from "../components/admin/TabbedBody";
import { gql, useApolloClient } from "@apollo/client";

export default function EntriesSyncPage() {
    const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
    const [searchLang, setSearchLang] = useState('');
    const [searchText, setSearchText] = useState('');
    const [orgs, setOrgs] = useState([]);
    const gqlClient = useApolloClient();

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
                setOrgs(result.data.orgs);
            };
            doOrgs();
        },
        []
    );
    return (
        <>
            <Header
                orgs={orgs.map(o => o.id)}
                selectedOrgIndex={selectedOrgIndex}
                setSelectedOrgIndex={setSelectedOrgIndex}
                searchLang={searchLang}
                setSearchLang={setSearchLang}
                searchText={searchText}
                setSearchText={setSearchText}
            />
            <Box id="body">
                {orgs.length > 0 ?
                    <TabbedBody
                        selectedOrgRecord={orgs[selectedOrgIndex]}
                        searchLang={searchLang}
                        searchText={searchText}
                    /> :
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <Box>
                            <Typography variant="h3">Loading</Typography>
                        </Box>
                    </Paper>
                }
            </Box>
        </>
    )
}
