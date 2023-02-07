import { FormLabel, Grid, TextField } from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import { directionText } from "../i18n/languageDirection";

export default function UploadFormField({inputValue,setInputValue,inputError,errorText,formTextFieldLabel,}) {
  const appLang = useContext(AppLangContext);
  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "45%",
      }}
    >
      <FormLabel id="demo-radio-buttons-group-label">
        {formTextFieldLabel}
      </FormLabel>
      <TextField
        fullWidth
        id="outlined-basic"
        onChange={setInputValue}
        value={inputValue}
        error={inputError}
        helperText={errorText}
        dir={directionText(appLang)}
      />
    </Grid>
  );
}
