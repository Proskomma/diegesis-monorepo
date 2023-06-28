import React, { useState } from 'react'
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import langTable from "../i18n/languages.json";
const { Button, Drawer, Box, Select, MenuItem } = MuiMaterial;
const { UIConfigControlPanel, FlexibleHome, FlexibleEntryDetailUI, FlexibleEntriesListUI, useUIConfigContext } = DiegesisUI.FlexibleDesign;
const { FlexibleEntriesListPage } = FlexibleEntriesListUI;
const { FlexibleEntryDetail } = FlexibleEntryDetailUI;

export default function UIConfigPage() {
    const [open, setOpen] = useState(false);
    const gqlClient = useApolloClient();
    const { getRootUIConfig } = useUIConfigContext();
    const { appLang, mutateState: mutateAppState, clientStructure } = useAppContext();

    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setOpen((open) => !open);
    };

    const onConfigSave = async () => {
        try {
            const rootConfig = getRootUIConfig()
            const query = `
            mutation SaveFlexibleUIConfig(
                $id: String!
                $className: String
                $componentName: String!
                $configPath: String!
                $contents: JSON
                $flexibles: JSON
                $markdowns: JSON
                $styles: JSON
                $uiConfigs: JSON
              ) {
                saveFlexibleUIConfig(
                  id: $id
                  className: $className
                  componentName: $componentName
                  configPath: $configPath
                  contents: $contents
                  flexibles: $flexibles
                  markdowns: $markdowns
                  styles: $styles
                  uiConfigs: $uiConfigs
                )
              }`;
            await gqlClient.mutate({ mutation: gql`${query}`, variables: { ...rootConfig } });
        } catch (err) {
            console.error('failed to save flexible ui config', err);
            return;
        }
    }

    return (
        <>
            <Button onClick={toggleDrawer} variant="contained">
                Open Setting Panel
            </Button>
            <FlexibleHome id="HomePage" parentPath="/" />
            <FlexibleEntriesListPage id="ListPage" parentPath="/list" />
            <FlexibleEntryDetail id="EntryDetailPage" parentPath="/entry-detail" />
            <Drawer
                anchor="left"
                open={open}
                onClose={toggleDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 'calc(100% - 50px)',
                        background: '#eee',
                        padding: '20px',
                    },
                }}
            >
                <Box display={'flex'} alignItems={'center'} justifyContent={'flex-end'} padding={'0px'} gap={2}>
                    <Select
                        id="lang_selector"
                        value={appLang}
                        label="Language"
                        size="small"
                        color="primary"
                        sx={{ backgroundColor: "#FFF" }}
                        onChange={(ev) => { mutateAppState({ appLang: ev.target.value }) }}
                    >
                        {
                            Object.entries(langTable)
                                .filter(kv => (clientStructure?.languages?.includes(kv[0])) || kv[0] === "en")
                                .map((kv, n) => <MenuItem
                                    key={n}
                                    value={kv[0]}
                                >
                                    {kv[1].autonym}
                                </MenuItem>
                                )
                        }
                    </Select>
                    <Button onClick={() => { setOpen(false); }}>
                        Close
                    </Button>
                </Box>
                <UIConfigControlPanel onConfigSave={onConfigSave} />
            </Drawer>
        </>
    )
}