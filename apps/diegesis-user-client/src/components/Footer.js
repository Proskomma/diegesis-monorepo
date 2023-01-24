import {Box, Typography} from '@mui/material';
import { useContext } from 'react';
import AppLangContext from '../contexts/AppLangContext';
import i18n from '../i18n';
import { directionText} from "../i18n/languageDirection";

export default function Footer() {

    const appLang = useContext(AppLangContext);
    const start = i18n(appLang,'FOOTER_START')
    const end = i18n(appLang,'FOOTER_END')
    const link = i18n(appLang,'FOOTER_LINK')

    const linkStyles = {
        color: "#FFF"
    }
    return <Box dir={directionText(appLang)} id="footer" sx={{backgroundColor: "primary.main", color: "#FFF", p: 3}}>
        <Typography variant="body2">{start}
            <a href="http://mvh.bible" target="_blank" rel="noreferrer" style={linkStyles}>MVH Solutions</a>
            {end}
            <a href="http://doc.proskomma.bible" target="_blank" rel="noreferrer" style={linkStyles}>{link}</a>.
        </Typography>
        <Typography variant="body2">© MVH Solutions 2023</Typography>
    </Box>
}
