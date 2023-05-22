import {Box} from '@mui/material';
import { useContext } from 'react';
import AppLangContext from '../contexts/AppLangContext';
import AppLangResourcesContext from '../contexts/AppLangResourcesContext';
import { directionText } from "../i18n/languageDirection";
import ReactMarkdown from 'react-markdown';

export default function Footer() {

    const appLang = useContext(AppLangContext);
    const appLangResources = useContext(AppLangResourcesContext);

    return <Box dir={directionText(appLang)} id="footer" sx={{backgroundColor: "primary.main", color: "#FFF", p: 3}}>
        <ReactMarkdown>
            {appLangResources.footer && appLangResources.footer.body}
        </ReactMarkdown>
    </Box>
}
