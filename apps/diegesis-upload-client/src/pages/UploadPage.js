import React, { useContext, useState } from "react";
import { useFormControl } from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import LangSelector from "../components/LangSelector";
import { directionText } from "../i18n/languageDirection";

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);

  const [formValues, setformValues] = useState({
    source: "",
    title: "",
    description: "",
    langCode: "",
    script: "",
    copyright: "",
    abbreviation: "",
    textDirection: "",
  });
  const field_required = i18n(appLang, "FIELD_REQUIRED");
  const formValidators = {
    title: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      return ret;
    },
    description: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      return ret;
    },
    script: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      return ret;
    },
    copyright: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      return ret;
    },
    abbreviation: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      return ret;
    },
  };

  const submitHandle = () => {
    
  };

  const isValidForm = (keys) => {
    for (const k in keys) {
      if (!formValidators[k]){
        continue
      }
      if (formValidators[k](formValues[k]).length > 0) {
        return false;
      }
    }
    return true
  };

  return (
    <Container fixed className="uploadpage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <form onClick={submitHandle}>
        <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            {i18n(appLang, "Add_Document")}
          </Typography>

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="source">
            {i18n(appLang, "CONTROLS_SOURCE")}
          </FormLabel>
          <TextField
            fullWidth
            name="source"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, source: e.target.value })
            }
            value={formValues.source}
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="title">
            {i18n(appLang, "CONTROLS_TITLE")}
          </FormLabel>
          <TextField
            fullWidth
            name="title"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, title: e.target.value })
            }
            value={formValues.title}
            error={formValidators.title(formValues.title).length > 0}
            helperText={formValidators.title(formValues.title).join("; ")}
            inputProps={{ maxLength: 32 }}
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="description">
            {i18n(appLang, "DESCRIPTION")}
          </FormLabel>
          <TextField
            fullWidth
            name="description"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, description: e.target.value })
            }
            value={formValues.description}
            error={
              formValidators.description(formValues.description).length > 0
            }
            helperText={formValidators
              .description(formValues.description)
              .join("; ")}
            inputProps={{ maxLength: 255 }}
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="langCode">
            {i18n(appLang, "LANGUAGE_CODE")}
          </FormLabel>
          <LangSelector
            name="langCode"
            langCode={formValues.langCode}
            setlangCode={(e) =>
              setformValues({ ...formValues, langCode: e.target.value })
            }
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="script">
            {i18n(appLang, "SCRIPT")}
          </FormLabel>
          <TextField
            fullWidth
            name="script"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, script: e.target.value })
            }
            value={formValues.script}
            error={formValidators.script(formValues.script).length > 0}
            helperText={formValidators.script(formValues.script).join("; ")}
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="copyright">
            {i18n(appLang, "ADMIN_DETAILS_COPYRIGHT")}
          </FormLabel>
          <TextField
            fullWidth
            name="copyright"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, copyright: e.target.value })
            }
            value={formValues.copyright}
            error={formValidators.copyright(formValues.copyright).length > 0}
            helperText={formValidators
              .copyright(formValues.copyright)
              .join("; ")}
            inputProps={{ maxLength: 12 }}
          />

          <FormLabel id="demo-radio-buttons-group-label" htmlFor="abbreviation">
            {i18n(appLang, "ADMIN_DETAILS_ABBREVIATION")}
          </FormLabel>
          <TextField
            fullWidth
            name="abbreviation"
            id="outlined-basic"
            onChange={(e) =>
              setformValues({ ...formValues, abbreviation: e.target.value })
            }
            value={formValues.abbreviation}
            error={
              formValidators.abbreviation(formValues.abbreviation).length > 0
            }
            helperText={formValidators
              .abbreviation(formValues.abbreviation)
              .join("; ")}
            inputProps={{ maxLength: 12 }}
          />

          <FormLabel
            id="demo-radio-buttons-group-label"
            htmlFor="textDirection"
          >
            {i18n(appLang, "TEXT_DIRECTION")}
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            defaultValue="ltr"
            onChange={(e) =>
              setformValues({ ...formValues, textDirection: e.target.value })
            }
            value={formValues.textDirection}
          >
            <FormControlLabel
              value="ltr"
              control={<Radio />}
              label={i18n(appLang, "LTR")}
            />
            <FormControlLabel
              value="rtl"
              control={<Radio />}
              label={i18n(appLang, "RTL")}
            />
          </RadioGroup>
        </Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          style={{ marginBottom: "20px" }}
          disabled={!isValidForm(formValues)}
        >
          {i18n(appLang, "SUBMIT")}
        </Button>
      </form>
      <Footer />
    </Container>
  );
}
