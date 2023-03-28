import React, { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Home } from "@mui/icons-material";

import langTable from "../i18n/languages.json";
import AppLangContext from "../contexts/AppLangContext";
import { alignmentText } from "../i18n/languageDirection";

export default function Header({children, setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const handleLanguageChange = (e) => setAppLanguage(e.target.value);

  const linkBoxStyles = {
    m: 3,
  };

  const selectedLinkStyles = {
    color: "#fff",
  };
  return (
    <AppBar position="fixed">
      <Toolbar dir={alignmentText(appLang) === "right" ? "rtl" : "ltr"}>
        {window.location.pathname === `/uploads/` ? (
          <Box
            sx={{ display: "flex", flexDirection: "row", flexGrow: 1, m: 3 }}
          >
            <RouterLink to={`/uploads/add-scripture-usfm`}>
              <Add sx={selectedLinkStyles}></Add>
            </RouterLink>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
            <RouterLink to={`/uploads/`}>
              <Box sx={linkBoxStyles}>
                <Home sx={selectedLinkStyles}/>
              </Box>
            </RouterLink>
          </Box>
        )}
        <Box>
          <Select
            id="doc_selector"
            value={appLang || "pleaseChoose"}
            label="Document"
            size="small"
            color="primary"
            sx={{ marginRight: "1em", backgroundColor: "#FFF" }}
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
