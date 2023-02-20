import { Tab, Tabs } from "@mui/material";
import React, { useState } from "react";

export default function TableHeader({selectedTabIndex,setSelectedTabIndex}) {

  const tableOfFiles = {
    0: "usfm",
    1: "sfm ",
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
        <Tab key={n} label={val[1]} id="simple-tab-0" aria-controls="simple-tabpanel-0" />
      ))}
    </Tabs>
  );
}
