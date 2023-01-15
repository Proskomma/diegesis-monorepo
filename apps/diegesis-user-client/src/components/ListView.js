import React from 'react';
import {useQuery, gql} from "@apollo/client";
import {Link as RouterLink} from 'react-router-dom';
import {Typography, Grid} from "@mui/material";
import {searchQuery} from '../lib/search';
import GqlError from "./GqlError";
import Spinner from './Spinner';

export default function ListView({searchTerms}) {

    const queryString = searchQuery(
        `query {
            localEntries%searchClause% {
                source
                types
                id
                language
                owner
                revision
                title
                bookResourceTypes
                succinctRecord: canonResource(type:"succinct") {type}
                vrsRecord: canonResource(type:"succinct") {type}
                nOT: stat(field:"nOT")
                nNT: stat(field:"nNT")
                nDC: stat(field:"nDC")
                nIntroductions: stat(field:"nIntroductions")
                nHeadings: stat(field:"nHeadings")
                nFootnotes: stat(field:"nFootnotes")
                nXrefs: stat(field:"nXrefs")
                nStrong: stat(field:"nStrong")
                nLemma: stat(field:"nLemma")
                nGloss: stat(field:"nGloss")
                nContent: stat(field:"nContent")
                nOccurrences: stat(field:"nOccurrences")
                nChapters: stat(field:"nChapters")
                nVerses: stat(field:"nVerses")
                hasSuccinctError
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
                            sx={{
                                fontWeight: "bold",
                                fontSize: "x-small"
                            }}>{localTranslation.types?.join(', ') || "?"}</Typography>
                <Typography variant="body2"
                            sx={{
                                fontWeight: "bold",
                                fontSize: "x-small"
                            }}>{localTranslation.owner}@{localTranslation.source}</Typography>
                <Typography variant="body2"
                            sx={{fontWeight: "bold", fontSize: "x-small"}}>{localTranslation.language}</Typography>
            </Grid>
            <Grid item xs={10} md={6}>
                <RouterLink
                    to={`/entry/details/${localTranslation.source}/${localTranslation.id}/${localTranslation.revision.replace(/\s/g, "__")}`}
                    style={{textDecoration: "none"}}>
                    <Typography sx={{fontWeight: 'bold', textAlign: "center"}}
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
    let displayRows = [];
    data.localEntries.forEach(
        lt => {
            displayRows.push(rowData(lt));
        }
    );
    return <Grid container xs={12}>
        {displayRows}
    </Grid>


}
