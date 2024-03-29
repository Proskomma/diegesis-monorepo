import {Select, MenuItem} from "@mui/material";
import i18n from "../i18n";
import { directionText, fontFamily } from "../i18n/languageDirection";
import { useAppContext } from "../contexts/AppContext";

export default function SortSelector({sortField, setSortField}) {
    const {appLang} = useAppContext();
    return (
        <Select
            id="sort_selector"
            value={sortField}
            label="Sort by"
            size="small"
            color="secondary"
            sx={{marginLeft: "1em", backgroundColor: "#FFF"}}
            onChange={(event) => setSortField(event.target.value)}
            style={{ fontFamily : fontFamily(appLang)}}
        >
            {
                [["title", i18n(appLang, "CONTROLS_TITLE") ], ["languageCode",i18n(appLang, "CONTROLS_LANGUAGE")], ["source",i18n(appLang, "CONTROLS_SOURCE")], ["owner",i18n(appLang, "CONTROLS_OWNER")], ["id", i18n(appLang, "CONTROLS_ID") ]]
                    .map(
                        (option, index) => (
                            <MenuItem
                                dir={directionText(appLang)} 
                                key={index}
                                value={option[0]}
                                style={{ fontFamily : fontFamily(appLang)}}
                            >
                                {`${i18n(appLang, "CONTROLS_SORT_BY")} ${option[1]}`}
                            </MenuItem>
                        )
                    )
            }

        </Select>
    )
}
