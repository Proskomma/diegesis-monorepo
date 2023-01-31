import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import LangSelector from "../components/LangSelector";
import { directionText } from "../i18n/languageDirection";

const documentTypeRegex = /text.*/;
const scriptRegex = /^[A-Za-z0-9]{1,16}$/;
const abbreviationRegex = /^[A-Za-z][A-Za-z0-9]+$/;
const documentRegex = /^\\id ([A-Z1-6]{3})/;
const catchTitleRegex = /([A-Z1-6]{3})/;

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const field_required = i18n(appLang, "FIELD_REQUIRED");
  const [uploads, setUploads] = useState([]);
  const [formValues, setformValues] = useState({
    title: "",
    description: "",
    langCode: "pleaseChoose",
    script: "",
    copyright: "",
    abbreviation: "",
    textDirection: "",
    uploads: [],
  });
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const changeHandler = (e) => {
    const { files } = e.target;
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(documentTypeRegex)) {
        validFiles.push(file);
      }
    }
    if (validFiles.length) {
      setUploads(validFiles);
    }
  };

  useEffect(() => {
    const newUploadContent = [],
      fileReaders = [];
    let isCancel = false;
    uploads.forEach((file) => {
      const fileReader = new FileReader();
      fileReaders.push(fileReader);
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result) {
          if (!result.match(documentRegex)) {
            setOpen(true);
          } else {
            setOpen(false);
            newUploadContent.push({
              content: result,
              type: file.type,
              name: file.name,
            });
          }
        }
      };
      fileReader.readAsText(file);
    });
    setformValues({ ...formValues, uploads: newUploadContent });
    return () => {
      isCancel = true;
      fileReaders.forEach((fileReader) => {
        if (fileReader.readyState === 1) {
          fileReader.abort();
        }
      });
    };
  }, [uploads]);

  const formValidators = {
    title: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 64) {
        ret.push("invalid text length");
      }
      return ret;
    },
    description: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 255) {
        ret.push("invalid text length");
      }
      return ret;
    },
    script: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (!str.trim().match(scriptRegex)) {
        ret.push("invalid text");
      }
      return ret;
    },
    copyright: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (str.trim().length < 6 || str.trim().length > 64) {
        ret.push("invalid text length");
      }
      return ret;
    },
    abbreviation: (str) => {
      let ret = [];
      if (str.trim().length === 0) {
        ret.push(field_required);
      }
      if (!str.trim().match(abbreviationRegex)) {
        ret.push("invalid text");
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
  console.log(formValues);
  console.log(open);

  return (
    <Container fixed className="uploadpage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <form>
        <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            {i18n(appLang, "Add_Document")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
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
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
              <FormLabel
                id="demo-radio-buttons-group-label"
                htmlFor="description"
              >
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
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
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
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
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
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
              <FormLabel
                id="demo-radio-buttons-group-label"
                htmlFor="copyright"
              >
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
                error={
                  formValidators.copyright(formValues.copyright).length > 0
                }
                helperText={formValidators
                  .copyright(formValues.copyright)
                  .join("; ")}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "45%",
              }}
            >
              <FormLabel
                id="demo-radio-buttons-group-label"
                htmlFor="abbreviation"
              >
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
                  formValidators.abbreviation(formValues.abbreviation).length >
                  0
                }
                helperText={formValidators
                  .abbreviation(formValues.abbreviation)
                  .join("; ")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Box
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
                  setformValues({
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
            </Box>
            <Box
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
            </Box>
          </Box>
          <Box>
            <Paper style={{ marginTop: "5%" }}>
              {uploads.map((upload, idx) => {
                return (
                  <>
                    <Grid
                      item
                      xs={2}
                      style={{
                        fontWeight: "bold",
                        marginLeft: "5%",
                      }}
                    >
                      <Grid item>
                        <span>Document {idx + 1} name :</span>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      style={{
                        marginLeft: "5%",
                      }}
                    >
                      <Grid item>{upload.name}</Grid>
                      {/* <Grid item>{upload.content}</Grid> */}
                    </Grid>
                  </>
                );
              })}
            </Paper>
          </Box>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert
                onClose={handleClose}
                severity="error"
                sx={{
                  width: "100%",
                  vertical: "bottom",
                  horizontal: "center",
                }}
              >
                Not Valid Document!
              </Alert>
            </Snackbar>
          </Stack>
        </Box>
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
      <Footer />
    </Container>
  );
}
