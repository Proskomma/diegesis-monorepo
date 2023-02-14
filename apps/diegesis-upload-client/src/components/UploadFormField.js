import { FormLabel, Grid, TextField } from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import { directionText } from "../i18n/languageDirection";
import i18n from "../i18n";

export default function UploadFormField({name,inputValue,setInputValue,validationSpec,formTextFieldLabel,setInvalidFields,invalidFields}) {
  const appLang = useContext(AppLangContext);
  let hasError = false 
  let errorMessages = []
  let trimmedInput = inputValue.trim()
  const requiredError = i18n(appLang,"ERROR_REQUIRED")
  const tooShortError = i18n(appLang,"ERROR_TOO_SHORT")
  const tooLongError = i18n(appLang,"ERROR_TOO_LONG")
  const regexError = i18n(appLang,"ERROR_REGEX")
  if( validationSpec.required && trimmedInput.length === 0){
    hasError= true 
    errorMessages.push(requiredError)
  }else {
    if( validationSpec.minLength && trimmedInput.length < validationSpec.minLength){
      hasError= true 
      errorMessages.push(tooShortError)
    }
    if( validationSpec.maxLength && trimmedInput.length > validationSpec.maxLength){
      hasError= true 
      errorMessages.push(tooLongError)
    }
    if( validationSpec.regex && !trimmedInput.match(validationSpec.regex)){
      hasError= true 
      errorMessages.push(regexError)
    }
  }
  let newInvalidFields = { ...invalidFields}
  if(!name in newInvalidFields || newInvalidFields[name] !== hasError){
    newInvalidFields[name]=hasError
    setInvalidFields(newInvalidFields)
  }
  return (
    <Grid item xs={12} md={6}>
      <FormLabel id="demo-radio-buttons-group-label">
        {formTextFieldLabel}
      </FormLabel>
      <TextField
        fullWidth
        id="outlined-basic"
        onChange={setInputValue}
        value={inputValue}
        error={hasError}
        helperText={errorMessages.join(';')}
        dir={directionText(appLang)}
      />
    </Grid>
  );
}
