import {Tab, Tabs} from "@mui/material";
import React, {useContext} from "react";
import AppLangContext from "../contexts/AppLangContext";
import {fontFamily} from "../i18n/languageDirection";

export default function AddTabsHeader({selectedTabIndex, setSelectedTabIndex}) {
    const appLang = useContext(AppLangContext);
    const tabDetails = [
        {
            id: "scriptureUsfm",
            label: "Scripture USFM"
        },
      {
        id: "uwNotes",
        label: "uW Notes"
      }
    ];

    const handleChange = (e, value) => {
        setSelectedTabIndex(value);
    };
    return (
        <Tabs
            size="small"
            value={selectedTabIndex}
            onChange={handleChange}
            aria-label="upload-type-tabs"
        >
            {tabDetails.map((tab, n) => (
                <Tab style={{fontFamily: fontFamily(appLang)}} key={n} label={tab.label} id={`simple-tab-${n}`}
                     aria-controls={`simple-tabpanel-${n}`}/>
            ))}
        </Tabs>
    );
}
