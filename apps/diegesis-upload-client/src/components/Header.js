import React, { useContext} from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Box, Select, MenuItem, Fab, SvgIcon } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import langTable from "../i18n/languages.json";
import AppLangContext from "../contexts/AppLangContext";
import { alignmentText } from "../i18n/languageDirection";

export default function Header({ children, setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const handleLanguageChange = (e) => setAppLanguage(e.target.value);

  function HomeIcon(props) {
    return (
      <SvgIcon {...props}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </SvgIcon>
    );
  }

  const showPathNAme = () => {
    let ret;
    if (window.location.pathname === `/uploads/add`) {
      ret = true;
    } else {
      ret = false;
    }
    return ret;
  };

  return (
    <AppBar position="fixed">
      <Toolbar dir={alignmentText(appLang) === "right" ? "rtl" : "ltr"}>
        {!showPathNAme() ? (
          <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
            <Fab color="light" aria-label="add">
              <RouterLink to={`/uploads/add`}>
                <AddIcon sx={{ fontSize: 40 , color:'blue' }}/>
              </RouterLink>
            </Fab>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
            <Fab color="light" aria-label="home">
              <RouterLink to={`/uploads`}>
                <HomeIcon sx={{ fontSize: 40 , color:'blue' }} />
              </RouterLink>
            </Fab>
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
