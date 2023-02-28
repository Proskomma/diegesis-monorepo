import { Tab, Tabs } from "@mui/material";
import React, { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import { setFontFamily } from "../i18n/languageDirection";

export default function TableHeader({selectedTabIndex,setSelectedTabIndex}) {
  const appLang = useContext(AppLangContext);
  const tableOfFiles = {
    0: "usfm",
    1: "perf",
    2: "simplePerf",
    3: "Sofria",
  };
  
  const handleChange = (e, value) => {
    setSelectedTabIndex(tableOfFiles[value]);
  };
  return (
    <Tabs
      size="small"
      value={selectedTabIndex}
      onChange={handleChange}
      aria-label="types tabs"
    >
      {Object.entries(tableOfFiles).map((val,n) => (
        <Tab  style={{ fontFamily : setFontFamily(appLang)}} key={n} label={val[1]} id="simple-tab-0" aria-controls="simple-tabpanel-0" />
      ))}
    </Tabs>
  );
}
