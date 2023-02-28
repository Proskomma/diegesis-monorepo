import {Box, Typography} from '@mui/material';
import { useContext } from 'react';
import AppLangContext from '../contexts/AppLangContext';
import i18n from '../i18n';
import { directionText, setFontFamily} from "../i18n/languageDirection";

export default function Footer() {

    const appLang = useContext(AppLangContext);

    const linkStyles = {
        color: "#FFF"
    }
    return <Box style={{marginTop:"5%"}} dir={directionText(appLang)} id="footer" sx={{backgroundColor: "primary.main", color: "#FFF", p: 3}}>
        <Typography variant="body2" style={{ fontFamily : setFontFamily(appLang)}}>{i18n(appLang,'FOOTER_START')}
            <a href="http://mvh.bible" target="_blank" rel="noreferrer" style={linkStyles}>MVH Solutions</a>
            {i18n(appLang,'FOOTER_END')}
            <a href="http://doc.proskomma.bible" target="_blank" rel="noreferrer" style={linkStyles}>{i18n(appLang,'FOOTER_LINK')}</a>.
        </Typography>
        <Typography variant="body2" style={{ fontFamily : setFontFamily(appLang)}}>© MVH Solutions 2023</Typography>
    </Box>
}
