import React from 'react';
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
// const ProskommaRequire = require('proskomma-core');

export default function EntryBrowsePage() {

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
    // console.log(ProskommaRequire);
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

    if (entryInfo.canonResource.content) {
        pk.loadSuccinctDocSet(JSON.parse(entryInfo.canonResource.content));
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}><ArrowBack/></RouterLink>
                </Button>
                {entryInfo.title}
            </Typography>
            {
                entryInfo.canonResource &&
                entryInfo.canonResource.content && <BrowseScripture pk={pk}/>
            }
            {
                (!entryInfo.canonResource || !entryInfo.canonResource.content) &&
                <Typography paragraph="true">Unable to render this translation at present: please try later</Typography>
            }
            <Footer/>
        </Box>
    </Container>;

}
