import React, {useContext} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Toolbar, Box, Select, MenuItem, Fab} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import langTable from "../i18n/languages.json";
import AppLangContext from "../contexts/AppLangContext";
import {alignmentText} from "../i18n/languageDirection";

export default function Header({children, setAppLanguage}) {

    const appLang = useContext(AppLangContext);

    const handleLanguageChange = (e) => setAppLanguage(e.target.value);

    return (
        <AppBar position="fixed">
            <Toolbar dir={alignmentText(appLang) === "right" ? "rtl" : "ltr"}>
                <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
                    <Fab color="light" aria-label="add">
                        <RouterLink to={`/uploads/add`}>
                            <AddIcon/>
                        </RouterLink>
                    </Fab>
                </Box>
                <Box>
                    <Select
                        id="doc_selector"
                        value={appLang || "pleaseChoose"}
                        label="Document"
                        size="small"
                        color="primary"
                        sx={{marginRight: "1em", backgroundColor: "#FFF"}}
                        onChange={(event) => handleLanguageChange(event)}
                    >
                        <MenuItem key={-1} value={"pleaseChoose"}>
                            --
                        </MenuItem>
                        {Object.entries(langTable).map((kv, n) => (
                            <MenuItem key={n} value={kv[0]}>
                                {kv[1].autonym}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Toolbar>
            {children}
        </AppBar>
    );
}
