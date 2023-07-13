/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import { Box } from "@mui/material";
import { DiegesisUI } from '@eten-lab/ui-kit';
import { useAppContext } from "../../contexts/AppContext";
import i18n from "../../i18n";
const { FlexibleSelectControl, FlexibleSearchBox } = DiegesisUI.FlexibleDesign;

const DROPDOWN_DEFAULT_LABEL = '--Select--'
export default function EntriesFilter({ parentPath, languages = [], onFilterChange = (payload) => { } }) {
    const { appLang } = useAppContext();
    const gqlClient = useApolloClient();
    const [orgDropdown, setOrgDropdown] = useState({ options: [], value: '' });
    const [langDropdown, setLangDropdown] = useState({ options: [], value: '' });

    useEffect(() => {
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
            const dropdownOptions = result.data.orgs.map(o => ({ id: o.id, title: o.id }));
            setOrgDropdown({ options: dropdownOptions, value: dropdownOptions[0]?.id });
            onFilterChange({ org: dropdownOptions[0]?.id });
        };
        doOrgs();
    }, [])

    useEffect(() => {
        const langOptions = [...(languages ?? [])]
        langOptions.splice(0, 0, { id: DROPDOWN_DEFAULT_LABEL, title: DROPDOWN_DEFAULT_LABEL, langCode: '' });
        setLangDropdown({
            ...langDropdown,
            options: langOptions,
            value: langDropdown.value || langOptions[0]?.title
        });
    }, [languages])

    const onOrgChange = (value) => {
        setOrgDropdown({ ...orgDropdown, value });
        onFilterChange({ org: value });
    }
    const onLangChange = (value) => {
        setLangDropdown({ ...langDropdown, value });
        const langIdx = langDropdown.options.findIndex(o => o.id === value);
        onFilterChange({ lang: langDropdown.options[langIdx]?.langCode });
    }
    const onSearchBtnClick = (value) => {
        onFilterChange({ term: value });
    }

    return (<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ minWidth: '175px' }}>
            <FlexibleSelectControl
                id={"local-entries-org"}
                parentPath={parentPath}
                label={'ORG'}
                options={orgDropdown.options}
                value={orgDropdown.value}
                onChange={onOrgChange}
            />
        </Box>
        <Box sx={{ minWidth: '175px' }}>
            <FlexibleSelectControl
                id={"local-entries-lang"}
                parentPath={parentPath}
                label={'Language'}
                options={langDropdown.options}
                value={langDropdown.value}
                onChange={onLangChange}
            />
        </Box>
        <Box>
            <FlexibleSearchBox
                id={"local-entries-search"}
                parentPath={parentPath}
                placeholder={i18n(appLang, "SEARCH_PLACEHOLDER")}
                onSearchBtnClick={onSearchBtnClick}
            />
        </Box>
    </Box>)
}