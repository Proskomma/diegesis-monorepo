import {FormLabel, Grid, MenuItem, Select } from "@mui/material";
import languagesList from "../i18n/languagesList.json";

export default function LangSelector({
  langCode,
  setlangCode,
  selectLanguageLabel,
}) {
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
        <MenuItem key={-1} value={"pleaseChoose"}>
          Please Select a language
        </MenuItem>
        {Object.entries(languagesList).map((kv, n) => (
          <MenuItem key={n} value={kv[1]}>
            {kv[0]}
          </MenuItem>
        ))}
      </Select>
    </Grid>
  );
}
