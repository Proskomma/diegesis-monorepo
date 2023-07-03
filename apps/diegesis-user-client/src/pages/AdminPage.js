/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@mui/material";
import Header from '../components/admin/Header';
import TabbedBody from '../components/admin/TabbedBody';
import GqlLoading from "../components/GqlLoading";
import { useEffect, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";

export default function AdminPage(props) {
    const gqlClient = useApolloClient();
    const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
    const [searchLang, setSearchLang] = useState('');
    const [searchText, setSearchText] = useState('');
    const [orgs, setOrgs] = useState([]);
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
        },[]);
    return <>
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
                <GqlLoading />
            }
        </Box>
    </>
}