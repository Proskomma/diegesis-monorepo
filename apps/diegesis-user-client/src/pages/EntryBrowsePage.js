import React from 'react';
import {Container, Typography, Box, Button} from "@mui/material";
import {useParams, Link as RouterLink} from "react-router-dom";
import {ArrowBack, Info, Download} from '@mui/icons-material';
import {gql, useQuery} from "@apollo/client";
import {Proskomma} from 'proskomma-core';
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BrowseScripture from "../components/BrowseScripture";

export default function EntryBrowsePage() {

    const {source, entryId, revision} = useParams();

    const queryString =
        `query {
          org(name:"""%source%""") {
            localTranslation(
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              languageCode
              title
              succinct
            }
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

    const translationInfo = data.org.localTranslation;

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

    if (translationInfo.succinct) {
        pk.loadSuccinctDocSet(JSON.parse(translationInfo.succinct));
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to="/list"><ArrowBack/></RouterLink>
                </Button>
                {translationInfo.title}
                <Button>
                    <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}><Info/></RouterLink>
                </Button>
                <Button>
                    <RouterLink
                        to={`/entry/download/${source}/${entryId}/${revision}`}><Download/></RouterLink>
                </Button>
            </Typography>
            {translationInfo.succinct && <BrowseScripture pk={pk}/>}
            {!translationInfo.succinct &&
            <Typography paragraph="true">Unable to render this translation at present: please try later</Typography>}
            <Footer/>
        </Box>
    </Container>;

}
