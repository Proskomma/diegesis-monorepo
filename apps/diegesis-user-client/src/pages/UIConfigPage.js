import React, { useState } from 'react'
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
const { Button, Drawer } = MuiMaterial;
const { UIConfigControlPanel, FlexibleHome, FlexibleEntryDetailUI, FlexibleEntriesListUI, useUIConfigContext } = DiegesisUI.FlexibleDesign;
const { FlexibleEntriesListPage } = FlexibleEntriesListUI;
const { FlexibleEntryDetail } = FlexibleEntryDetailUI;

export default function UIConfigPage({ setAppLanguage }) {
    const [open, setOpen] = useState(false);
    const gqlClient = useApolloClient();
    const { getRootUIConfig } = useUIConfigContext();
    const navigate = useNavigate();

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
            console.error('onConfigSave error::', err);
            navigate(`/login?redirect=/ui-config`);
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
                <UIConfigControlPanel onConfigSave={onConfigSave} />
            </Drawer>
        </>
    )
}