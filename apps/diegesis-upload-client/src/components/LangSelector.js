import {InputLabel, MenuItem, Select } from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import languagesList from "../i18n/languagesList.json";
import { directionText, FontFamily } from "../i18n/languageDirection";

export default function LangSelector({langCode,setlangCode,selectLanguageLabel,}) {
  const appLang = useContext(AppLangContext);
  return (
    <>
      <InputLabel id="selectLabel" htmlFor="langCode" style={{ fontFamily : FontFamily(appLang)}}>
        {selectLanguageLabel}
      </InputLabel>
      <Select
        labelId="selectLabel"
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
    </>
  );
}
