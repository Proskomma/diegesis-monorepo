import {Tab, Tabs} from "@mui/material";
import React from "react";

export default function TabsTabs({selectedTabIndex, setSelectedTabIndex, selectedOrgRecord}) {

    const handleChange = (event, newValue) => {
        setSelectedTabIndex(newValue);
    };

    return <Tabs size="small" value={selectedTabIndex} onChange={handleChange} aria-label="local/remote tabs">
        <Tab label="Local" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
    </Tabs>
}
