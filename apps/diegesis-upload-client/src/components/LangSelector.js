import {FormLabel, Grid, MenuItem, Select } from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import languagesList from "../i18n/languagesList.json";
import { directionText } from "../i18n/languageDirection";

export default function LangSelector({langCode,setlangCode,selectLanguageLabel,}) {
  const appLang = useContext(AppLangContext);
  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "45%",
      }}
    >
      <FormLabel id="demo-radio-buttons-group-label" htmlFor="langCode">
        {selectLanguageLabel}
      </FormLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={langCode}
        label="Language Code"
        onChange={setlangCode}
        defaultValue={"pleaseChoose"}
      >
        <MenuItem key={-1} value={"pleaseChoose"} dir={directionText(appLang)}>
          {i18n(appLang, "SELECT_LANGUAGE")}
        </MenuItem>
        {Object.entries(languagesList).map((kv, n) => (
          <MenuItem key={n} value={kv[1]} dir={directionText(appLang)}>
            {i18n(appLang, `${kv[1]}_LANG`)}
          </MenuItem>
        ))}
      </Select>
    </Grid>
  );
}
