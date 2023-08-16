import React, {useContext} from "react";
import {Container, Typography} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {directionText, fontFamily} from "../i18n/languageDirection";
import ScriptureUsfmForm from "../components/ScriptureUsfmForm";
import UploadTypeSelector from "../components/UploadTypeSelector";


export default function AddScriptureUsfmPage({setAppLanguage}) {
    const appLang = useContext(AppLangContext);

    return (
        <Container fixed className="upload-page">
            <Header setAppLanguage={setAppLanguage} selected="add"/>
            <Typography
                dir={directionText(appLang)}
                variant="h4"
                paragraph="true"
                sx={{mt: "100px"}}
                style={{fontFamily: fontFamily(appLang)}}
            >
                {i18n(appLang, "Add_Scripture_Usfm_Document")}
            </Typography>
            <UploadTypeSelector currentType="scripture-usfm"/>
            <ScriptureUsfmForm/>
            <Footer/>
        </Container>
    );
}
