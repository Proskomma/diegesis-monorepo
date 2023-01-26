import {Tab, Tabs} from "@mui/material";
import {CloudSync} from '@mui/icons-material';
import React from "react";

export default function TabsTabs({selectedTabIndex, setSelectedTabIndex, selectedOrgRecord}) {

    const handleChange = (event, newValue) => {
        setSelectedTabIndex(newValue);
    };

    return <Tabs size="small" value={selectedTabIndex} onChange={handleChange} aria-label="local/remote tabs">
        <Tab label="Remote" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
        <Tab label="Local" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
        <Tab icon={<CloudSync/>} id="simple-tab-2" aria-controls="simple-tabpanel-2" disabled={!selectedOrgRecord.canSync}/>
    </Tabs>
}
