/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, IconButton } from "@mui/material";
import { DeleteOutlineOutlined } from '@mui/icons-material';
import i18n from '../i18n';
import { useEffect, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import PageLayout from "../components/PageLayout";
import { DiegesisUI } from '@eten-lab/ui-kit';
import { useAppContext } from "../contexts/AppContext";
const { FlexibleSelectControl, FlexibleSearchBox } = DiegesisUI.FlexibleDesign;
const { EntriesDataTable } = DiegesisUI.FlexibleDesign.FlexibleEntriesListUI;

export default function LocalEntries({ url }) {
    const { appLang } = useAppContext();
    const gqlClient = useApolloClient();
    const [orgDropdown, setOrgDropdown] = useState({ options: [], curOrg: '' });
    const [dataTable, setDataTable] = useState({ cellsConfig: [], entries: [] })

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
                setOrgDropdown({ options: result.data.orgs.map(o => ({ id: o.id, title: o.id })) });
            };
            doOrgs();

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
                id: 'succinct',
                numeric: false,
                disablePadding: false,
                label: 'Succinct?',
            },
            {
                id: 'action',
                numeric: false,
                disablePadding: true,
                label: 'Actions',
                render() {
                    return (
                        <IconButton>
                            <DeleteOutlineOutlined />
                        </IconButton>
                    );
                },
                }]
            setDataTable({ cellsConfig, entries: [] });
        }, []);


    const searchBoxProps = {
        placeholder: i18n(appLang, "LIST_PAGE_SEARCH_PLACEHOLDER"),
        onSearchTextChange: (value) => { },
        onSearchBtnClick: (value) => { }
    }
    const selectControlProps = {
        label: 'Org',
        value: orgDropdown.curOrg,
        options: orgDropdown.options,
        onChange: (value) => {
            setOrgDropdown({ ...orgDropdown, curOrg: value });
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
            <EntriesDataTable {...dataTable} />
        </Container>
    </PageLayout>
}