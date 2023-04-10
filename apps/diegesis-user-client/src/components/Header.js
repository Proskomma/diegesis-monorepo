import React, {useState, useContext} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Toolbar, Box, Select, MenuItem, IconButton, Drawer, ListItemButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import langTable from "../i18n/languages.json"
import AppLangContext from "../contexts/AppLangContext";
import { alignmentText } from "../i18n/languageDirection";
import AppLangResourcesContext from "../contexts/AppLangResourcesContext";

export default function Header({selected, children, setAppLanguage}) {

    const appLang = useContext(AppLangContext);
    const appLangResources = useContext(AppLangResourcesContext);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    const handleLanguageChange = e => setAppLanguage(e.target.value)

    const toggleDrawer = (openness) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setHamburgerOpen(openness);
    };

    return (
        <AppBar position="fixed">
            <Toolbar dir={alignmentText(appLang) === 'right' ? 'rtl' : 'ltr'}>
                <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Drawer
                        anchor={alignmentText(appLang)}
                        variant="temporary"
                        open={hamburgerOpen}
                        onClose={toggleDrawer(false)}
                        onOpen={toggleDrawer(true)}
                    >

                        <Box>
                            {
                                appLangResources.urlData &&
                                    appLangResources.urlData.map(ud => <ListItemButton>
                                        <RouterLink to={`/${ud.url === 'home' ? "" : ud.url}`}>
                                            {ud.menuText}
                                        </RouterLink>
                                    </ListItemButton>)
                            }
                        </Box>
                    </Drawer>
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
                        <MenuItem
                            key={-1}
                            value={"pleaseChoose"}
                        >
                            --
                        </MenuItem>
                        {
                            Object.entries(langTable)
                                .filter(kv => (appLangResources.languages && appLangResources.languages.includes(kv[0])) || kv[0] === "en")
                                .map((kv, n) => <MenuItem
                                key={n}
                                value={kv[0]}
                            >
                                {kv[1].autonym}
                            </MenuItem>
                        )
                        }
                    </Select>
                </Box>
            </Toolbar>
            {children}
        </AppBar>
    );
}
