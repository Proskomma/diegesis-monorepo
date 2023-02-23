import React, {useContext, useState, useEffect} from 'react';
import {Typography, TextField, Grid} from "@mui/material";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";

export default function SearchScripture({pk}) {

    const appLang = useContext(AppLangContext);
    const searchTitle = i18n(appLang, "CONTROLS_SEARCH");

    const [searchQuery, setSearchQuery] = useState("");

    const [matches, setMatches] = useState([]);
    
    useEffect(() => {
      const re = /^[HhGg]\d{3,4}$/;

      if(!re.test(searchQuery))
      {
        console.log("no match");
        return;
      }

      const uCSearchQuery = searchQuery.toUpperCase;

      const strongAtts = "attribute/spanWithAtts/w/strong/0/";

      const query = 
        `{
          documents(sortedBy:"paratext") {
            cvMatching( withScopes:["${strongAtts}${uCSearchQuery}"]) {
              scopeLabels text
            }
          }
        }`;

        // Syntax like this should work when searching for multiple inputs
        // cvMatching( withScopes:["${strongAtts}${searchQuery[0]}", "${strongAtts}${searchQuery[1]}"]) {

        const result = pk.gqlQuerySync(query);

        console.log(result);
    }, [searchQuery]);

    return (
        <Grid container>
            <Grid item xs={12} sm={4} md={3} lg={2}>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                label={searchTitle}
                size="small"
                id="searchOwner"
                variant="filled"
                color="primary"
                sx={{ display: "flex", marginLeft: "1em" }}
              />
            </Grid>
            <Grid item xs={12}>
                {
                  matches.length === 0 ?
                  <Typography>No results...</Typography> :
                  <Typography>Results found, but we'll have to work on how to display them...</Typography>
                }
            </Grid>
        </Grid>
    )
}
