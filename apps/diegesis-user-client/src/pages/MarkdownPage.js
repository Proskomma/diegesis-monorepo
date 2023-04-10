import React, {useContext} from 'react';
import {Container, Box} from "@mui/material";
import {gql, useQuery} from "@apollo/client";
import ReactMarkdown from 'react-markdown';


import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import {directionText} from "../i18n/languageDirection";
import Spinner from "../components/Spinner";
import GqlError from "../components/GqlError";

export default function MarkdownPage({setAppLanguage, url}) {

    const appLang = useContext(AppLangContext);

    const queryString = `{
                  clientStructure {
                    page(language:"%lang%" url: "%url%") {
                      body
                    }
                  }
                  }`
        .replace(/%lang%/g, appLang)
        .replace(/%url%/g, url);

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
    return (
        <Container fixed className="homepage">
            <Header setAppLanguage={setAppLanguage} selected="home"/>
            <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
                <ReactMarkdown>{(data && data.clientStructure.page.body) || "???"}</ReactMarkdown>
                <Footer/>
            </Box>
        </Container>
    );
}
