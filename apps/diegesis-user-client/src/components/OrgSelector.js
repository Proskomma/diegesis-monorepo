import { Select, MenuItem } from "@mui/material";
import i18n from "../i18n";
import { directionText, fontFamily } from "../i18n/languageDirection";
import { useAppContext } from "../contexts/AppContext";

export default function OrgSelector({orgs, searchOrg, setSearchOrg}) {

    const {appLang} = useAppContext();
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
                style={{ fontFamily : fontFamily(appLang)}}
            >
                {i18n(appLang, "CONTROLS_ALL")}
            </MenuItem>
            {orgs.map((option, index) => (
                <MenuItem
                    dir={directionText(appLang)} 
                    key={index}
                    value={option}
                    style={{ fontFamily : fontFamily(appLang)}}
                >
                    {option}
                </MenuItem>
            ))}
        </Select>
    )
}
