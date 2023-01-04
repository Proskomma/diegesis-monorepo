import React from 'react';
import {useQuery, gql} from "@apollo/client";
import {Link as RouterLink} from 'react-router-dom';
import {Typography, Grid} from "@mui/material";
import {searchQuery} from '../lib/search';
import GqlError from "./GqlError";
import Spinner from './Spinner';

export default function ListView({searchTerms}) {

    const queryString = searchQuery(
        `query localTranslations {
        orgs {
            id: name
            localTranslations%searchClause% {
                resourceTypes
                id
                languageCode
                owner
                revision
                title
                hasUsfm
                hasUsx
                hasSuccinct
                hasSuccinctError
                hasVrs
                nOT,
                nNT,
                nDC,
                nIntroductions,
                nHeadings,
                nFootnotes,
                nXrefs,
                nStrong,
                nLemma,
                nGloss,
                nContent,
                nOccurrences,
                nChapters,
                nVerses
            }
        }
    }`,
        searchTerms
    );

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
    );


    function rowData(localTranslation) {
        const canonStrings = [];
        if (localTranslation.nOT && localTranslation.nOT > 0) {
            canonStrings.push(`${localTranslation.nOT} OT`);
        }
        if (localTranslation.nNT && localTranslation.nNT > 0) {
            canonStrings.push(`${localTranslation.nNT} NT`);
        }
        if (localTranslation.nDC && localTranslation.nDC > 0) {
            canonStrings.push(`${localTranslation.nDC} DC`);
        }
        const featureStrings = [];
        if (localTranslation.nIntroductions > 0) {
            featureStrings.push("Intros");
        }
        if (localTranslation.nHeadings > 0) {
            featureStrings.push("Headings");
        }
        if (localTranslation.nFootnotes > 0) {
            featureStrings.push("Footnotes");
        }
        if (localTranslation.nXrefs > 0) {
            featureStrings.push("Xrefs");
        }
        if (localTranslation.nStrong > 0) {
            featureStrings.push("Strong");
        }
        if (localTranslation.nLemma > 0) {
            featureStrings.push("Lemma");
        }
        if (localTranslation.nGloss > 0) {
            featureStrings.push("Gloss");
        }
        if (localTranslation.nContent > 0) {
            featureStrings.push("Content");
        }
        if (localTranslation.nOccurrences > 0) {
            featureStrings.push("Occurrences");
        }
        return <Grid container xs={12} sx={{borderTop: "solid 1px #ccc", padding: "2px", marginBottom: "2px"}}>
            <Grid item xs={12} md={2}>
                <Typography variant="body2"
                            sx={{fontWeight: "bold", fontSize: "x-small"}}>{localTranslation.resourceTypes?.join(', ') || "?"}</Typography>
                <Typography variant="body2"
                            sx={{fontWeight: "bold", fontSize: "x-small"}}>{localTranslation.owner}@{localTranslation.org}</Typography>
                <Typography variant="body2"
                            sx={{fontWeight: "bold", fontSize: "x-small"}}>{localTranslation.languageCode}</Typography>
            </Grid>
            <Grid item xs={10} md={6}>
                <RouterLink
                    to={`/entry/browse/${localTranslation.org}/${localTranslation.owner.replace(/\s/g, "__")}/${localTranslation.id}/${localTranslation.revision.replace(/\s/g, "__")}`}
                    style={{textDecoration: "none"}}> <Typography sx={{fontWeight: 'bold', textAlign: "center"}}
                                                                  variant="body1">
                    {localTranslation.title}
                </Typography>
                </RouterLink>
            </Grid>
            <Grid item xs={2}>
                <Typography variant="body2" sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "x-small"
                }}>{canonStrings.join(', ')}</Typography>
                <Typography variant="body2" sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "x-small"
                }}>{featureStrings.join(', ')}</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
                <Typography variant="body2" sx={{textAlign: "right", fontSize: "x-small"}}>
                    ID {localTranslation.id}
                </Typography>
                <Typography variant="body2" sx={{textAlign: "right", fontSize: "x-small"}}>
                    Rev {localTranslation.revision}
                </Typography>
            </Grid>
        </Grid>
    }

    if (loading) {
        return <Spinner/>
    }
    if (error) {
        return <GqlError error={error}/>
    }
    let translations = [];
    const so = searchTerms.org.trim().toLowerCase();
    for (const orgData of data.orgs) {
        orgData.localTranslations.forEach(
            lt => {
                if (so === 'all' || so === orgData.id.toLowerCase()) {
                    translations.push({...lt, org: orgData.id});
                }
            }
        );
    }
    translations.sort((a, b) => a[searchTerms.sortField || 'title'].toLowerCase().localeCompare(b[searchTerms.sortField || 'title'].toLowerCase()));
    if (searchTerms.sortDirection === 'z-a') {
        translations.reverse();
    }
    let displayRows = [];
    translations.forEach(
        lt => {
            displayRows.push(rowData(lt));
        }
    );
    return <Grid container xs={12}>
        {displayRows}
    </Grid>


}
