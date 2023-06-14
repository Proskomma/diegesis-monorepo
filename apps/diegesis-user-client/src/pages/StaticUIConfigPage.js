import React, { useState } from 'react'
import { useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Box, Container, Tab, Tabs, TabPanel } from '@mui/material';

export default function StaticUIConfigPage() {
    const [tab, setTab] = useState(0);
    const gqlClient = useApolloClient();
    const { appLang, mutateState: mutateAppState, clientStructure } = useAppContext();

    const onTabChange = (ev) => {
        debugger
        setTab(ev.target.value)
    }
    return (
        <Container>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={onTabChange}>
                    <Tab label="Item One" />
                    <Tab label="Item Two"  />
                    <Tab label="Item Three" />
                </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
                Item One
            </TabPanel>
            <TabPanel value={tab} index={1}>
                Item Two
            </TabPanel>
            <TabPanel value={tab} index={2}>
                Item Three
            </TabPanel>
        </Container>
    )
}