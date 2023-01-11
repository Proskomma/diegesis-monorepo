import {Container, Typography, Box} from "@mui/material";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import { useContext } from "react";
import i18n from "../translations";

export default function WhoPage({setAppLanguage}) {

    const indentSx = {
        ml: 3
    };

    const appLang = useContext(AppLangContext);
    console.log(appLang);
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
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>{title}</Typography>
            <Typography variant="h6" paragraph="true">{subtitle}</Typography>
            <Typography variant="body1" paragraph="true">{paragraph}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx}>- {digital}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx}>- {door}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx}>- {bible}</Typography>
            <Typography variant="body1" paragraph="true" sx={indentSx}>- {vachan}</Typography>
            <Typography variant="h6" paragraph="true">{sSubtitle}</Typography>
            <Typography variant="body1" paragraph="true">{sParagraph} <a
                href="http://mvh.bible" target="_blank" rel="noreferrer">MVH Solutions</a>.</Typography>
            <Footer/>
        </Box>
    </Container>;

}
