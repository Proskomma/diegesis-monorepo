import React, { useContext } from 'react';
import {useQuery, gql} from "@apollo/client";
import {Link as RouterLink} from 'react-router-dom';
import {Typography, Grid} from "@mui/material";
import {searchQuery} from '../lib/search';
import GqlError from "./GqlError";
import Spinner from './Spinner';

export default function ListView({searchTerms}) {

    // const appLang = useContext(AppLangContext);
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
    console.log(data.localEntries.map(e=> e.stats))
    let displayRows = [];
    data.localEntries.forEach(
        lt => {
            displayRows.push(rowData(lt));
        }
    );
    return <Grid container xs={12}>
        <Grid item xs={6} sm={4} md={2}>
            <Typography variant="body1" sx={{fontWeight: "bold"}}>Resource Types</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
            <Typography variant="body1" sx={{fontWeight: "bold"}}>Source</Typography>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
            <Typography variant="body1" sx={{fontWeight: "bold"}}>Language</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{fontWeight: "bold"}}>Title</Typography>
        </Grid>
        {displayRows}
    </Grid>


}
