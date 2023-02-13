import React, {useContext} from 'react';
import { Container, Typography, Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Proskomma } from 'proskomma-core/esm';
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BrowseScripture from "../components/BrowseScripture";
import {directionText} from "../i18n/languageDirection";
import AppLangContext from "../contexts/AppLangContext";
// const ProskommaRequire = require('proskomma-core');

export default function EntryBrowsePage({setAppLanguage}) {
    const appLang = useContext(AppLangContext);
    const {source, entryId, revision} = useParams();

    const queryString =
        `query {
            localEntry(
              source: """%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              language
              title
              canonResource(type:"succinct") {content}
            }
        }`
            .replace("%source%", source)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision);

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
    );

    if (loading) {
        return <Spinner/>;
    }

    if (error) {
        return <GqlError error={error}/>;
    }

    const entryInfo = data.localEntry;

    console.log(Proskomma);
    
    if (!entryInfo) {
        return (
            <Container fixed className="homepage">
                <Header setAppLanguage={setAppLanguage} selected="list"/>
                <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
                    <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                        <Button>
                            <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}><ArrowBack/></RouterLink>
                        </Button>
                        Processing
                    </Typography>
                    <Typography paragraph="true">
                        Unable to render this new translation at present as server is currently processing the new data: please try again in a few minutes.
                    </Typography>
                </Box>
            </Container>
        );
    }

    const pk = new Proskomma([
        {
            name: "source",
            type: "string",
            regex: "^[^\\s]+$"
        },
        {
            name: "project",
            type: "string",
            regex: "^[^\\s]+$"
        },
        {
            name: "revision",
            type: "string",
            regex: "^[^\\s]+$"
        },
    ]);

    if (entryInfo?.canonResource?.content) {
        pk.loadSuccinctDocSet(JSON.parse(entryInfo.canonResource.content));
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}><ArrowBack/></RouterLink>
                </Button>
                {entryInfo && entryInfo.title}
                {!entryInfo && "Loading..."}
            </Typography>
            {
                entryInfo &&
                entryInfo.canonResource &&
                entryInfo.canonResource.content && <BrowseScripture pk={pk}/>
            }
            {
                (!entryInfo || !entryInfo.canonResource || !entryInfo.canonResource.content) &&
                <Typography paragraph="true">
                    Unable to render this new translation at present as server has not yet processed the new data: please try again in a few minutes.
                </Typography>
            }
            <Footer/>
        </Box>
    </Container>;

}
