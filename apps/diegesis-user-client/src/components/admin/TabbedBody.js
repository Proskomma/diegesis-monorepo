import {Box} from "@mui/material";
import React, {useState} from "react";
import TabsTabs from "./TabsTabs";
import LocalTab from "./LocalTab";
import SyncTab from "./SyncTab";

export default function TabbedBody({selectedOrgRecord, searchLang, searchText}) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    return <>
        <TabsTabs selectedTabIndex={selectedTabIndex} setSelectedTabIndex={setSelectedTabIndex} selectedOrgRecord={selectedOrgRecord}/>
        <Box value={selectedTabIndex} role="tabpanel" hidden={selectedTabIndex !== 0} index={0}>
            <LocalTab selectedOrg={selectedOrgRecord.id} searchLang={searchLang} searchText={searchText} />
        </Box>
        <Box value={selectedTabIndex} role="tabpanel" hidden={selectedTabIndex !== 1} index={1}>
            <SyncTab selectedOrgRecord={selectedOrgRecord} searchLang={searchLang} searchText={searchText} />
        </Box>
    </>;
}
