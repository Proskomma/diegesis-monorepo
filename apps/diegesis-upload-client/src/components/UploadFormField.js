import { Box, FormLabel, Grid, TextField } from "@mui/material";

export default function UploadFormField({
  inputValue,
  setInputValue,
  inputError,
  errorText,
  formTextFieldLabel,
}) {
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
      />
    </Grid>
  );
}
