import {Container, Typography, Box} from "@mui/material";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import { useContext } from "react";
import i18n from "../i18n";
import { directionText, FontFamily } from "../i18n/languageDirection";

export default function BlendPage({ setAppLanguage }) {
    const appLang = useContext(AppLangContext);
    return <Container fixed className="homepage">
        <Header setAppLanguage={setAppLanguage} selected="mix"/>
        <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}} style={{ fontFamily : FontFamily(appLang)}}>{i18n(appLang,"BLEND_PAGE")}</Typography>
            <Footer/>
        </Box>
    </Container>;

}
