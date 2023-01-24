import {Select, MenuItem} from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText } from "../i18n/languageDirection";

export default function SortSelector({sortField, setSortField}) {
    const appLang = useContext(AppLangContext);
    return (
        <Select
            id="sort_selector"
            value={sortField}
            label="Sort by"
            size="small"
            color="secondary"
            sx={{marginLeft: "1em", backgroundColor: "#FFF"}}
            onChange={(event) => setSortField(event.target.value)}
        >
            {
                [["title", i18n(appLang, "CONTROLS_TITLE") ], ["languageCode",i18n(appLang, "CONTROLS_LANGUAGE")], ["source",i18n(appLang, "CONTROLS_SOURCE")], ["owner",i18n(appLang, "CONTROLS_OWNER")], ["id", i18n(appLang, "CONTROLS_ID") ]]
                    .map(
                        (option, index) => (
                            <MenuItem
                                dir={directionText(appLang)} 
                                key={index}
                                value={option[0]}
                            >
                                {`${i18n(appLang, "CONTROLS_SORT_BY")} ${option[1]}`}
                            </MenuItem>
                        )
                    )
            }

        </Select>
    )
}
