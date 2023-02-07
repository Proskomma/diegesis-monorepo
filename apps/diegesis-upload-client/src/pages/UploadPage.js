import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Button,
  Container,
  FormControlLabel,
  FormLabel,
  Input,
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
import UploadFormField from "../components/UploadFormField";
import UploadedFileField from "../components/UploadedFileField";
import { useSnackbar } from "notistack";

const documentTypeRegex = /(text.*)/;
const scriptRegex = /^[A-Za-z0-9]{1,16}$/;
const abbreviationRegex = /^[A-Za-z][A-Za-z0-9]+$/;
const documentRegex = /^\\id ([A-Z1-6]{3})/;

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const { enqueueSnackbar } = useSnackbar();
  const field_required = i18n(appLang, "FIELD_REQUIRED");
  const textLengthError = i18n(appLang, "INVALID_LENGTH");
  const [uploads, setUploads] = useState([]);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    langCode: "pleaseChoose",
    script: "",
    copyright: "",
    abbreviation: "",
    textDirection: "",
  });
  const [fileValues, setFileValues] = useState([]);

  const changeHandler = (e) => {
    const { files } = e.target;
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(documentTypeRegex)) {
        validFiles.push(file);
      } else {
        enqueueSnackbar(i18n(appLang, "WRONG_FILES"), {
          autoHideDuration: 3000,
          variant: "error"
        });
      }
    }
    setUploads(validFiles);
  };

  useEffect(() => {
    const newUploadContent = [];
    for (const file of uploads) {
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        const { result } = e.target;
        if (result) {
          if (!result.match(documentRegex)) {
          } else {
            newUploadContent.push({
              content: result,
              type: file.type,
              name: file.name,
            });
            setFileValues(newUploadContent);
          }
        }
      };
      fileReader.readAsText(file);
    }
  }, [uploads]);

  const formValidators = {
    title: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 64) {
        ret.push(textLengthError);
      }
      return ret;
    },
    description: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 255) {
        ret.push(textLengthError);
      }
      return ret;
    },
    script: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (!str.trim().match(scriptRegex)) {
        ret.push(textLengthError);
      }
      return ret;
    },
    copyright: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 64) {
        ret.push(textLengthError);
      }
      return ret;
    },
    abbreviation: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (!str.trim().match(abbreviationRegex)) {
        ret.push(textLengthError);
      }
      return ret;
    },
  };

  const isValidForm = (keys) => {
    for (const k in keys) {
      if (!formValidators[k]) {
        continue;
      }
      if (formValidators[k](formValues[k]).length > 0) {
        return false;
      }
    }
    return true;
  };

  return (
    <Container fixed className="uploadpage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <form>
        <Grid dir={directionText(appLang)} style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            {i18n(appLang, "Add_Document")}
          </Typography>

          <Grid
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <UploadFormField
              formTextFieldLabel={i18n(appLang, "CONTROLS_TITLE")}
              name="title"
              inputValue={formValues.title}
              setInputValue={(e) =>
                setFormValues({ ...formValues, title: e.target.value })
              }
              inputError={formValidators.title(formValues.title).length > 0}
              errorText={formValidators.title(formValues.title).join("; ")}
            ></UploadFormField>
            <UploadFormField
              formTextFieldLabel={i18n(appLang, "DESCRIPTION")}
              name="description"
              inputValue={formValues.description}
              setInputValue={(e) =>
                setFormValues({ ...formValues, description: e.target.value })
              }
              inputError={
                formValidators.description(formValues.description).length > 0
              }
              errorText={formValidators
                .description(formValues.description)
                .join("; ")}
            ></UploadFormField>
          </Grid>

          <Grid
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <LangSelector
              selectLanguageLabel={i18n(appLang, "LANGUAGE_CODE")}
              name="langCode"
              langCode={formValues.langCode}
              setlangCode={(e) =>
                setFormValues({ ...formValues, langCode: e.target.value })
              }
            />
            <UploadFormField
              formTextFieldLabel={i18n(appLang, "SCRIPT")}
              name="script"
              inputValue={formValues.script}
              setInputValue={(e) =>
                setFormValues({ ...formValues, script: e.target.value })
              }
              inputError={formValidators.script(formValues.script).length > 0}
              errorText={formValidators.script(formValues.script).join("; ")}
            ></UploadFormField>
          </Grid>

          <Grid
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <UploadFormField
              formTextFieldLabel={i18n(appLang, "ADMIN_DETAILS_COPYRIGHT")}
              name="copyright"
              inputValue={formValues.copyright}
              setInputValue={(e) =>
                setFormValues({ ...formValues, copyright: e.target.value })
              }
              inputError={
                formValidators.copyright(formValues.copyright).length > 0
              }
              errorText={formValidators
                .copyright(formValues.copyright)
                .join("; ")}
            ></UploadFormField>
            <UploadFormField
              formTextFieldLabel={i18n(appLang, "ADMIN_DETAILS_ABBREVIATION")}
              name="abbreviation"
              inputValue={formValues.abbreviation}
              setInputValue={(e) =>
                setFormValues({ ...formValues, abbreviation: e.target.value })
              }
              inputError={
                formValidators.abbreviation(formValues.abbreviation).length > 0
              }
              errorText={formValidators
                .abbreviation(formValues.abbreviation)
                .join("; ")}
            ></UploadFormField>
          </Grid>

          <Grid
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Grid
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
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
                  setFormValues({
                    ...formValues,
                    textDirection: e.target.value,
                  })
                }
                value={formValues.textDirection}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
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
            </Grid>
            <Grid
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
              <FormLabel
                id="demo-radio-buttons-group-label"
                htmlFor="textDirection"
              >
                {i18n(appLang, "Upload_documents")}
              </FormLabel>
              <br />
              <Input
                id="assets"
                onChange={changeHandler}
                type="file"
                accept="*/txt"
                inputProps={{ multiple: true }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          size="large"
          style={{ marginBottom: "20px", marginTop: "20px" }}
          disabled={!isValidForm(formValues)}
        >
          {i18n(appLang, "SUBMIT")}
        </Button>
      </form>
      <Grid container dir={directionText(appLang)}>
        <UploadedFileField files={fileValues}></UploadedFileField>
      </Grid>
      <Footer />
    </Container>
  );
}
