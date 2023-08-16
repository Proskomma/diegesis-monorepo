import React, {useContext} from "react";
import {Container, Typography} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {directionText, fontFamily} from "../i18n/languageDirection";
import UwNotesForm from "../components/UwNotesForm";
import UploadTypeSelector from "../components/UploadTypeSelector";


export default function AddUwNotesPage({setAppLanguage}) {
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
                {i18n(appLang, "Add_uW_Notes_Document")}
            </Typography>
            <UploadTypeSelector currentType="uw-notes"/>
            <UwNotesForm/>
            <Footer/>
        </Container>
    );
}
