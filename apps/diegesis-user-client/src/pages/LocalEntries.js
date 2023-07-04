/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container } from "@mui/material";
import i18n from '../i18n';
import { useEffect, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import PageLayout from "../components/PageLayout";
import { DiegesisUI } from '@eten-lab/ui-kit';
import { useAppContext } from "../contexts/AppContext";
const { FlexibleSelectControl, FlexibleSearchBox } = DiegesisUI.FlexibleDesign;
const { EntriesDataTable, MOCK_ENTRIES_DATA_TABLE_PROPS } = DiegesisUI.FlexibleDesign.FlexibleEntriesListUI;

export default function LocalEntries({ url }) {
    const { appLang } = useAppContext();
    const gqlClient = useApolloClient();
    const [orgs, setOrgs] = useState([]);
    const [curOrg, setCurOrg] = useState('');

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
                setOrgs(result.data.orgs.map(o => ({ id: o.id, title: o.id })));
            };
            doOrgs();
        }, []);

    const dataTableProps = {
        ...MOCK_ENTRIES_DATA_TABLE_PROPS
    }
    const searchBoxProps = {
        placeholder: i18n(appLang, "LIST_PAGE_SEARCH_PLACEHOLDER"),
        onSearchTextChange: (value) => { },
        onSearchBtnClick: (value) => { }
    }
    const selectControlProps = {
        label: 'ORG',
        value: curOrg,
        options: orgs,
        onChange: (value) => {
            setCurOrg(value)
        }
    }

    const parentPath = url ?? window.location.pathname
    return <PageLayout id="local-entries-page" parentPath={parentPath}>
        <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Box sx={{ minWidth: '275px' }}>
                    <FlexibleSelectControl {...selectControlProps} id={"local-entries-select-control"} parentPath={parentPath} />
                </Box>
                <Box>
                    <FlexibleSearchBox {...searchBoxProps} id={"local-entries-select-control"} parentPath={parentPath} />
                </Box>
            </Box>
            <EntriesDataTable {...dataTableProps} />
        </Container>
    </PageLayout>
}