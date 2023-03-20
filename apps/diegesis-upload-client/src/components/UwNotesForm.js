import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {directionText, FontFamily} from "../i18n/languageDirection";
import React, {useContext, useEffect, useState} from "react";
import {
    Button,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import LangSelector from "./LangSelector";
import UploadFormField from "./UploadFormField";
import UploadedFileField from "./UploadedFileField";
import {useSnackbar} from "notistack";
import {gql, useApolloClient} from "@apollo/client";

const documentSuffixRegex = /^[A-Za-z0-9_().-]+.tsv$/;
const documentRegex = /^[^\t\n]+(\t[^\t\n]+){6}\n/;
const BookRegex = /([a-zA-Z0-9]{3})\.tsv$/;

export default function UwNotesForm() {
    const client = useApolloClient();

    async function createEntry(client) {
        try {
            const query = buildQuery();
            await client.mutate({
                mutation: gql`
        ${query}
      `,
            });
        } catch (err) {
            setSubmitText("Error:" + err.msg);
            return;
        }
        setSubmitText("Submitted");
    }

    const appLang = useContext(AppLangContext);
    const {enqueueSnackbar} = useSnackbar();
    const [uploads, setUploads] = useState([]);
    const [invalidFields, setInvalidFields] = useState({});
    const [submitText, setSubmitText] = useState("");
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        langCode: "pleaseChoose",
        script: "",
        copyright: "",
        abbreviation: "",
        textDirection: "ltr",
    });
    const [fileValues, setFileValues] = useState([]);

    const changeHandler = (e) => {
        const {files} = e.target;
        const validFiles = [];
        const badFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name.match(documentSuffixRegex)) {
                validFiles.push(file);
            } else {
                badFiles.push(file);
            }
        }
        if (badFiles.length > 0) {
            enqueueSnackbar(
                i18n(appLang, "WRONG_FILES") + badFiles.join(", "),
                {
                    autoHideDuration: 3000,
                    variant: "error",
                }
            );
        }
        setUploads(validFiles);
    }


    useEffect(() => {
        function dedupe(elements) {
            let ret = [];
            let usedBooks = new Set([]);
            let ignoredBooks = [];
            for (const el of elements) {
                if (!usedBooks.has(el.type)) {
                    ret.push(el);
                    usedBooks.add(el.type);
                } else {
                    ignoredBooks.push(el.type);
                }
            }
            if (ignoredBooks.length > 0) {
                enqueueSnackbar(
                    `ignoring duplicate upload for ${ignoredBooks.join(";")}`,
                    {
                        autoHideDuration: 3000,
                        variant: "error",
                    }
                );
            }
            return ret;
        }

        const newUploadContent = [];
        for (const file of uploads) {
            const fileReader = new FileReader();
            fileReader.onloadend = (e) => {
                const {result} = e.target;
                if (result) {
                    if (!result.match(documentRegex)) {
                        return;
                    }
                    newUploadContent.push({
                        content: result,
                        type: file.name.match(BookRegex)[1],
                        name: file.name,
                    });
                    setFileValues(dedupe([...fileValues, ...newUploadContent]));
                }
            };
            fileReader.readAsText(file);
        }
    }, [uploads]);

    const fields = [
        {
            field: "title",
            i18n: "CONTROLS_TITLE",
            validations: {required: true, minLength: 6, maxLength: 64},
        },
        {
            field: "description",
            i18n: "DESCRIPTION",
            validations: {required: true, minLength: 6, maxLength: 255},
        },
        {
            field: "script",
            i18n: "SCRIPT",
            validations: {required: true, regex: /^[A-Za-z0-9]{1,16}$/},
        },
        {
            field: "copyright",
            i18n: "ADMIN_DETAILS_COPYRIGHT",
            validations: {required: true, minLength: 6, maxLength: 64},
        },
        {
            field: "abbreviation",
            i18n: "ADMIN_DETAILS_ABBREVIATION",
            validations: {required: true, regex: /^[A-Za-z][A-Za-z0-9]+$/},
        },
    ];

    const isValidForm = () => {
        return (
            Object.values(invalidFields).filter((v) => v).length === 0 &&
            uploads.length > 0
        );
    };

    const replacing = (data) => {
        return data.replace(/"""/g, `'''`);
    };

    const buildQuery = () => {
        let gqlBits = [];
        gqlBits.push("mutation { createLocalEntry(");
        gqlBits.push('contentType: "uwNotes"');
        gqlBits.push("metadata:[");
        for (const [key, value] of Object.entries(formValues)) {
            gqlBits.push("{");
            gqlBits.push(`key: """${replacing(key)}"""`);
            gqlBits.push(`value:"""${replacing(value)}"""`);
            gqlBits.push("}");
        }
        gqlBits.push("]");
        gqlBits.push("resources:[");
        for (const resource of fileValues) {
            gqlBits.push("{");
            gqlBits.push(`bookCode: """${replacing(resource.type)}"""`);
            gqlBits.push(`content:"""${replacing(resource.content)}"""`);
            gqlBits.push("}");
        }
        gqlBits.push("]");
        gqlBits.push(")}");
        return gqlBits.join("\n");
    };
    return (
        <form>
            <Grid dir={directionText(appLang)} container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5" paragraph="true" sx={{mt: "20px"}}
                                style={{fontFamily: FontFamily(appLang)}}>
                        {i18n(appLang, "METADATA")}
                    </Typography>
                </Grid>
                {submitText.length > 0 && <Grid item xs={12}>
                    {submitText}
                </Grid>
                }
                {fields.map((f) => (
                    <UploadFormField
                        formTextFieldLabel={i18n(appLang, f.i18n)}
                        name={f.field}
                        inputValue={formValues[f.field]}
                        setInputValue={(e) =>
                            setFormValues({...formValues, [f.field]: e.target.value})
                        }
                        validationSpec={f.validations}
                        setInvalidFields={setInvalidFields}
                        invalidFields={invalidFields}
                    />
                ))}
                <Grid item xs={12} md={6} lg={4}>
                    <LangSelector
                        selectLanguageLabel={i18n(appLang, "LANGUAGE_CODE")}
                        name="langCode"
                        langCode={formValues.langCode}
                        setlangCode={(e) =>
                            setFormValues({...formValues, langCode: e.target.value})
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormLabel id="text-direction-group-label" htmlFor="textDirection"
                               style={{fontFamily: FontFamily(appLang)}}>
                        {i18n(appLang, "TEXT_DIRECTION")}
                    </FormLabel>
                    <RadioGroup
                        aria-labelledby="text-direction-group-label"
                        name="text-direction-buttons-group"
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
                            control={<Radio/>}
                            label={i18n(appLang, "LTR")}
                            style={{fontFamily: FontFamily(appLang)}}
                        />
                        <FormControlLabel
                            value="rtl"
                            control={<Radio/>}
                            label={i18n(appLang, "RTL")}
                        />
                    </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h5" paragraph="true" sx={{mt: "20px"}}
                                style={{fontFamily: FontFamily(appLang)}}>
                        {i18n(appLang, "RESOURCES")}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <InputLabel id="uploadFilesId" style={{fontFamily: FontFamily(appLang)}}>
                        {i18n(appLang, "Upload_documents")}
                    </InputLabel>
                    <TextField
                        labelId="uploadFilesId"
                        onChange={changeHandler}
                        type="file"
                        accept="*/txt,*/usfm,*/sfm"
                        inputProps={{multiple: true}}
                    />
                </Grid>
                <UploadedFileField
                    setFileValues={setFileValues}
                    filesValues={fileValues}
                />
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        style={{marginBottom: "20px", marginTop: "20px", fontFamily: FontFamily(appLang)}}
                        disabled={!isValidForm(formValues) || submitText.length > 0}
                        onClick={() => createEntry(client)}
                    >
                        {i18n(appLang, "SUBMIT")}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
}
