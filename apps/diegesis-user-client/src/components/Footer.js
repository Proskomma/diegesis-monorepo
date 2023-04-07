import {Box, Typography} from '@mui/material';
import { useContext } from 'react';
import AppLangContext from '../contexts/AppLangContext';
import i18n from '../i18n';
import { directionText, fontFamily} from "../i18n/languageDirection";
import ReactMarkdown from 'react-markdown';
import {gql, useQuery} from "@apollo/client";
import Spinner from "./Spinner";
import GqlError from "./GqlError";

export default function Footer() {

    const appLang = useContext(AppLangContext);
    const start = i18n(appLang,'FOOTER_START')
    const end = i18n(appLang,'FOOTER_END')
    const link = i18n(appLang,'FOOTER_LINK')

    const queryString = `{
  clientStructure {
    footer(language: "es") {
      body
    }
  }
  }`;

    const {loading, error, data} = useQuery(
        gql`
      ${queryString}
    `
    );

    if (loading) {
        return <Spinner/>;
    }

    if (error) {
        return <GqlError error={error}/>;
    }


    const linkStyles = {
        color: "#FFF"
    }
    return <Box dir={directionText(appLang)} id="footer" sx={{backgroundColor: "primary.main", color: "#FFF", p: 3}}>
        <ReactMarkdown>
            {!loading && !error && data.clientStructure.footer.body}
        </ReactMarkdown>
    </Box>
}
