import React, { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Box, Select, MenuItem} from "@mui/material";
import {
  Home,
  Engineering,
  Dataset,
  Diversity3,
  Blender,
} from "@mui/icons-material";
import AppLangContext from "../contexts/AppLangContext";
import { i18nTables } from "../translations";
import i18n from "../translations";


export default function Header({ selected, children,setAppLanguage }) {
  const linkBoxStyles = {
    m: 3,
  };

  const selectedLinkStyles = {
    color: "#fff",
  };

  const linkStyles = {
    color: "#999",
  };

  const appLang = useContext(AppLangContext);
  console.log(appLang);

  const handleLanguageChange = e => setAppLanguage(e.target.value)


  return (
    <AppBar position="fixed">
      <Toolbar>
        <RouterLink to="/">
          <Box sx={linkBoxStyles}>
            <Home sx={selected === "home" ? selectedLinkStyles : linkStyles} />
          </Box>
        </RouterLink>
        <RouterLink to="/who">
          <Box sx={linkBoxStyles}>
            <Diversity3
              sx={selected === "who" ? selectedLinkStyles : linkStyles}
            />
          </Box>
        </RouterLink>
        <RouterLink to="/how">
          <Box sx={linkBoxStyles}>
            <Engineering
              sx={selected === "how" ? selectedLinkStyles : linkStyles}
            />
          </Box>
        </RouterLink>
        <RouterLink to="/list">
          <Box sx={linkBoxStyles}>
            <Dataset
              sx={selected === "list" ? selectedLinkStyles : linkStyles}
            />
          </Box>
        </RouterLink>
        <RouterLink to="/blend">
          <Box sx={linkBoxStyles}>
            <Blender
              sx={selected === "mix" ? selectedLinkStyles : linkStyles}
            />
          </Box>
        </RouterLink>
        <Select
            id="doc_selector"
            value={appLang || "pleaseChoose"}
            label="Document"
            size="small"
            color="primary"
            sx={{ marginRight: "1em", backgroundColor: "#FFF"}}
            onChange={(event) => handleLanguageChange(event)}
        >
            <MenuItem
                key={-1}
                value={"pleaseChoose"}
            >
                --
            </MenuItem>
            <MenuItem
                key={2}
                value={"en"}
            >
                English
            </MenuItem>
            <MenuItem
                key={0}
                value={"fr"}
            >
                French
            </MenuItem>
            {/* {langTable.map((id, name) => (
                <MenuItem
                    key={id}
                    value={name}
                >
                    {name}
                </MenuItem>
            ))} */}

        </Select>
      </Toolbar>
      {children}
    </AppBar>
  );
}
