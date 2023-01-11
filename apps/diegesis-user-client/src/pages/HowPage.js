import {Container, Typography, Box} from "@mui/material";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";

export default function HowPage({setAppLanguage}) {

    const appLang = useContext(AppLangContext);
    const title = i18n(appLang,'HOW_TITLE')
    const phrase = i18n(appLang,'HOW_PHRASE')
    const suitePhrase = i18n(appLang,'HOW_SUITE_PHRASE')
    const engine = i18n(appLang,'HOW_ENGINE')
    const endPhrase = i18n(appLang,'HOW_END_PHRASE')

    return <Container fixed className="homepage">
        <Header setAppLanguage={setAppLanguage} selected="how"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>{title}</Typography>
            <Typography variant="body1" paragraph="true">{phrase} <a href="https://github.com/Proskomma/diegesis-monorepo">Github</a>.
                    {suitePhrase} <a href="http://doc.proskomma.bible" target="_blank" rel="noreferrer">{engine}</a> 
                    {endPhrase}</Typography>
            <Footer/>
        </Box>
    </Container>;

}
