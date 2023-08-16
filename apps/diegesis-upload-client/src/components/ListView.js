import React, { useContext } from 'react';
import {useQuery, gql} from "@apollo/client";
import {Typography, Grid} from "@mui/material";
import {searchQuery} from '../lib/search';
import GqlError from "./GqlError";
import Spinner from './Spinner';
import i18n from '../i18n';
import AppLangContext from '../contexts/AppLangContext';
import { fontFamily } from '../i18n/languageDirection';

export default function ListView({searchTerms}) {

    const appLang = useContext(AppLangContext);
    const queryString = searchQuery(
        `query {
            localEntries%searchClause% {
                source
                types
                transId
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

    const languageCodeFormat = function languageCodeFormat(lang){
        let ret = i18n(appLang , `${lang}_LANG`);
        if(ret.includes('??') === true ){
            return lang
        }else{
            return ret
        }
    }

    function rowData(localTranslation) {
        return <Grid container xs={12} sx={{borderTop: "solid 1px #ccc", padding: "2px", marginBottom: "2px"}}>
            <Grid item xs={6} sm={3}>
                <Typography variant="body2" style={{ fontFamily : fontFamily(appLang)}}>{localTranslation.types?.join(', ') || "?"}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Typography variant="body2" style={{ fontFamily : fontFamily(appLang)}}>{localTranslation.owner}@{localTranslation.source}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
                <Typography variant="body2" style={{ fontFamily : fontFamily(appLang)}}>{languageCodeFormat(localTranslation.language)}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
                    <Typography variant="body1" style={{ fontFamily : fontFamily(appLang)}}>{localTranslation.title}</Typography>
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
        <Grid item xs={6} sm={3}>
            <Typography variant="body1" sx={{fontWeight: "bold"}} style={{ fontFamily : fontFamily(appLang)}}>{i18n(appLang,"RESOURCE_TYPES")}</Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
            <Typography variant="body1" sx={{fontWeight: "bold"}} style={{ fontFamily : fontFamily(appLang)}}>{i18n(appLang,"CONTROLS_SOURCE")}</Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
            <Typography variant="body1" sx={{fontWeight: "bold"}} style={{ fontFamily : fontFamily(appLang)}}>{i18n(appLang,"CONTROLS_LANGUAGE")}</Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
                <Typography variant="body1" sx={{fontWeight: "bold"}} style={{ fontFamily : fontFamily(appLang)}}>{i18n(appLang,"CONTROLS_TITLE")}</Typography>
        </Grid>
        {displayRows}
    </Grid>


}
