import {Box} from '@mui/material';
import { directionText } from "../i18n/languageDirection";
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../contexts/AppContext';

export default function Footer() {

    const {appLang, clientStructure} = useAppContext()

    return <Box dir={directionText(appLang)} id="footer" sx={{backgroundColor: "primary.main", color: "#FFF", p: 3}}>
        <ReactMarkdown>
            { clientStructure?.footer?.body ?? ''}
        </ReactMarkdown>
    </Box>
}
