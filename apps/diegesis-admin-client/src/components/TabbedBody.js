import {Box} from "@mui/material";
import React, {useState} from "react";
import TabsTabs from "./TabsTabs";
import LocalTab from "./LocalTab";
import RemoteTab from "./RemoteTab";
import SyncTab from "./SyncTab";

export default function TabbedBody({selectedOrg, searchLang, searchText}) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    return <>
        <TabsTabs selectedTabIndex={selectedTabIndex} setSelectedTabIndex={setSelectedTabIndex} selectedOrg={selectedOrg}/>
        <Box value={selectedTabIndex} role="tabpanel" hidden={selectedTabIndex !== 0} index={0}>
            <RemoteTab selectedOrg={selectedOrg} searchLang={searchLang} searchText={searchText} />
        </Box>
        <Box value={selectedTabIndex} role="tabpanel" hidden={selectedTabIndex !== 1} index={1}>
            <LocalTab selectedOrg={selectedOrg} searchLang={searchLang} searchText={searchText} />
        </Box>
        <Box value={selectedTabIndex} role="tabpanel" hidden={selectedTabIndex !== 2} index={2}>
            <SyncTab selectedOrg={selectedOrg} searchLang={searchLang} searchText={searchText} />
        </Box>
    </>;
}
