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
            }
        }`,
        searchTerms
    );

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
    );

    function rowData(localTranslation) {
        return <Grid container xs={12} sx={{borderTop: "solid 1px #ccc", padding: "2px", marginBottom: "2px"}}>
            <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2">{localTranslation.types?.join(', ') || "?"}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2">{localTranslation.owner}@{localTranslation.source}</Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
                <Typography variant="body2">{localTranslation.language}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <RouterLink
                    to={`/entry/details/${localTranslation.source}/${localTranslation.id}/${localTranslation.revision.replace(/\s/g, "__")}`}
                    style={{textDecoration: "none"}}>
                    <Typography variant="body1">{localTranslation.title}</Typography>
                </RouterLink>
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
