import {Container, Typography, Box} from "@mui/material";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import { useContext } from "react";
import i18n from "../i18n";
import {directionText, FontFamily} from "../i18n/languageDirection";

export default function WhoPage({setAppLanguage}) {

    const indentSx = {
        ml: 3
    };

    const appLang = useContext(AppLangContext);
    const title = i18n(appLang,'WHO_TITLE')
    const subtitle = i18n(appLang,'WHO_SUBTITLE1')
    const sSubtitle = i18n(appLang,'WHO_SUBTITLE2')
    const paragraph = i18n(appLang,'WHO_PARAGRAPHE1')
    const sParagraph = i18n(appLang,'WHO_PARAGRAPHE2')
    const digital = i18n(appLang,'WHO_DIGI')
    const door = i18n(appLang,'WHO_DOOR')
    const bible = i18n(appLang,'WHO_BIBLE')
    const vachan = i18n(appLang,'WHO_VACHAN')

    return <Container fixed className="whopage">
        <Header setAppLanguage={setAppLanguage} selected="who" />
        <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}} style={{ fontFamily : FontFamily(appLang)}}>{title}</Typography>
            <Typography variant="h6" paragraph="true" style={{ fontFamily : FontFamily(appLang)}}>{subtitle}</Typography>
            <Typography variant="body1" paragraph="true" style={{ fontFamily : FontFamily(appLang)}}>{paragraph}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx} style={{ fontFamily : FontFamily(appLang)}}>- {digital}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx} style={{ fontFamily : FontFamily(appLang)}}>- {door}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx} style={{ fontFamily : FontFamily(appLang)}}>- {bible}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx} style={{ fontFamily : FontFamily(appLang)}}>- {vachan}</Typography>
            <Typography variant="h6" paragraph="true" style={{ fontFamily : FontFamily(appLang)}}>{sSubtitle}</Typography>
            <Typography variant="body1" paragraph="true" style={{ fontFamily : FontFamily(appLang)}}>{sParagraph} <a
                href="http://mvh.bible" target="_blank" rel="noreferrer">MVH Solutions</a>.</Typography>
            <Footer/>
        </Box>
    </Container>;

}
