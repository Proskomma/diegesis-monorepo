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

const documentSuffixRegex = /^[A-Za-z0-9-_()]+(.txt|.usfm|.sfm)$/;
const documentRegex = /^\\id ([A-Z1-6]{3})/;

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const { enqueueSnackbar } = useSnackbar();
  const [uploads, setUploads] = useState([]);
  const [invalidFields, setInvalidFields] = useState({});
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
      if (file.name.match(documentSuffixRegex)) {
        validFiles.push(file);
      } else {
        enqueueSnackbar(i18n(appLang, "WRONG_FILES"), {
          autoHideDuration: 3000,
          variant: "error",
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

  const fields = [
    {
      field: "title",
      i18n: "CONTROLS_TITLE",
      validations: { required: true, minLength: 6, maxLength: 64 },
    },
    {
      field: "description",
      i18n: "DESCRIPTION",
      validations: { required: true, minLength: 6, maxLength: 255 },
    },
    {
      field: "script",
      i18n: "SCRIPT",
      validations: { required: true, regex: /^[A-Za-z0-9]{1,16}$/ },
    },
    {
      field: "copyright",
      i18n: "ADMIN_DETAILS_COPYRIGHT",
      validations: { required: true, minLength: 6, maxLength: 64 },
    },
    {
      field: "abbreviation",
      i18n: "ADMIN_DETAILS_ABBREVIATION",
      validations: { required: true, regex: /^[A-Za-z][A-Za-z0-9]+$/ },
    },
  ];
  const isValidForm = () => {
    return Object.values(invalidFields).filter(v=>v).length === 0;
  };

  return (
    <Container fixed className="uploadpage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <form>
        <Grid dir={directionText(appLang)} style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            {i18n(appLang, "Add_Document")}
          </Typography>

          <Grid container spacing={2}>
            {fields &&
              fields.map((f) => (
                <UploadFormField
                  formTextFieldLabel={i18n(appLang, f.i18n)}
                  name={f.field}
                  inputValue={formValues[f.field]}
                  setInputValue={(e) =>
                    setFormValues({ ...formValues, [f.field]: e.target.value })
                  }
                  validationSpec={f.validations}
                  setInvalidFields ={setInvalidFields}
                  invalidFields = {invalidFields}
                ></UploadFormField>
              ))}
          </Grid>
          <Grid>
            <LangSelector
              selectLanguageLabel={i18n(appLang, "LANGUAGE_CODE")}
              name="langCode"
              langCode={formValues.langCode}
              setlangCode={(e) =>
                setFormValues({ ...formValues, langCode: e.target.value })
              }
            />
          </Grid>
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
            accept="*/txt,*/usfm,*/sfm"
            inputProps={{ multiple: true }}
          />
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
      <UploadedFileField files={fileValues}></UploadedFileField>
      <Footer />
    </Container>
  );
}
