import { Select, MenuItem } from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText } from "../i18n/languageDirection";

export default function OrgSelector({orgs, searchOrg, setSearchOrg}) {

    const appLang = useContext(AppLangContext);
    return (
        <Select
            
            id="org_selector"
            value={searchOrg}
            label="Organization"
            size="small"
            color="primary"
            sx={{ marginRight: "1em", backgroundColor: "#FFF"}}
            onChange={(event) => setSearchOrg(event.target.value)}
        >
            <MenuItem
                key="all"
                value="all"
                dir={directionText(appLang)} 
            >
                {i18n(appLang, "CONTROLS_ALL")}
            </MenuItem>
            {orgs.map((option, index) => (
                <MenuItem
                    dir={directionText(appLang)} 
                    key={index}
                    value={option}
                >
                    {option}
                </MenuItem>
            ))}

        </Select>
    )
}
