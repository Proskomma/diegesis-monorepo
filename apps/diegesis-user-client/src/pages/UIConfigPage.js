import React, { useState } from 'react'
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
const { Button, Drawer } = MuiMaterial;
const { UIConfigControlPanel, FlexibleHome, FlexibleEntryDetailUI, FlexibleEntriesListUI } = DiegesisUI.FlexibleDesign;
const { FlexibleEntriesListPage } = FlexibleEntriesListUI;
const { FlexibleEntryDetail } = FlexibleEntryDetailUI;

export default function UIConfigPage({ setAppLanguage }) {
    const [open, setOpen] = useState(false);
    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setOpen((open) => !open);
    };

    const onConfigSave = (config) => {
        //@todo:: save config on server end
        console.log('//@todo:: save config on server end', config);
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