import React, {useContext} from "react";
import {Container, Typography} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {directionText, fontFamily} from "../i18n/languageDirection";
import TyndaleStudyNotesForm from "../components/TyndaleStudyNotesForm";
import UploadTypeSelector from "../components/UploadTypeSelector";

export default function AddTyndaleStudyNotesPage({setAppLanguage}) {
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
                {i18n(appLang, "Add_Tyndale_Study_Notes_Document")}
            </Typography>
            <UploadTypeSelector currentType="tyndale-study-notes"/>
            <TyndaleStudyNotesForm/>
            <Footer/>
        </Container>
    );
}
