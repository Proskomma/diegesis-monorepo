import React from 'react';
import { Container, Typography, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Proskomma } from 'proskomma-core';
import GqlError from "../components/GqlError";

import Spinner from "../components/Spinner";
import SearchScripture from "../components/SearchScripture";
import { directionText } from "../i18n/languageDirection";
import PageLayout from '../components/PageLayout';
import { useAppContext } from '../contexts/AppContext';
// const ProskommaRequire = require('proskomma-core');

export default function EntrySearchPage({ }) {
    const { appLang } = useAppContext();
    const { source, entryId, revision } = useParams();

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

    const { loading, error, data } = useQuery(
        gql`${queryString}`,
    );

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <GqlError error={error} />;
    }

    const entryInfo = data.localEntry;

    if (!entryInfo) {
        return (
            <PageLayout>
                <Container dir={directionText(appLang)} style={{ marginTop: "50px", marginBottom: "50px" }}>
                    <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
                        <Button>
                            <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}><ArrowBack /></RouterLink>
                        </Button>
                        Processing
                    </Typography>
                    <Typography paragraph="true">
                        Unable to render this new translation at present as server is currently processing the new data: please try again in a few minutes.
                    </Typography>
                </Container>
            </PageLayout>
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

    const setArrow = (lang) => {
        if (directionText(lang) === "ltr") {
            return <ArrowBack color="primary" />;
        }
        if (directionText(lang) === "rtl") {
            return <ArrowForward color="primary" />;
        }
    };

    return <PageLayout>
        <Container style={{ marginTop: "50px", marginBottom: "50px" }}>
            <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
                <Button>
                    <RouterLink to={`/entry/browse/${source}/${entryId}/${revision}`}>{setArrow(appLang)}</RouterLink>
                </Button>
                {entryInfo && entryInfo.title}
                {!entryInfo && "Loading..."}
            </Typography>
            {
                entryInfo &&
                entryInfo.canonResource &&
                entryInfo.canonResource.content && <SearchScripture pk={pk} />
            }
            {
                (!entryInfo || !entryInfo.canonResource || !entryInfo.canonResource.content) &&
                <Typography paragraph="true">
                    Unable to render this new translation at present as server has not yet processed the new data: please try again in a few minutes.
                </Typography>
            }
        </Container>
    </PageLayout>;
}
