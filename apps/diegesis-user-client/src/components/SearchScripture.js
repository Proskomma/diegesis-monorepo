import React, {useContext, useState, useEffect} from 'react';
import {Typography, TextField, Grid} from "@mui/material";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import DocSelector from "./DocSelector";

export default function SearchScripture({pk}) {

    const appLang = useContext(AppLangContext);
    const searchTitle = i18n(appLang, "CONTROLS_SEARCH");

    const [docId, setDocId] = useState("");
    const [docMenuItems, setDocMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [validQuery, setValidQuery] = useState(false);
    const [matches, setMatches] = useState([]);

    const docName = d => {
      return d.headers.filter(d => d.key === 'toc3')[0]?.value ||
          d.headers.filter(d => d.key === 'h')[0]?.value ||
          d.headers.filter(d => d.key === 'toc2')[0]?.value ||
          d.headers.filter(d => d.key === 'toc')[0]?.value ||
          d.headers.filter(d => d.key === 'bookCode')[0].value
    }

    useEffect(() => {
      const docSetInfo = pk.gqlQuerySync(
        `{
          docSets {
            documents(sortedBy:"paratext") {
              id
              headers { key value }
            }
          }
        }`
      );
      
      setDocId(docSetInfo.data.docSets[0].documents[0].id);
      setDocMenuItems(docSetInfo.data.docSets[0].documents.map(d => ({id: d.id, label: docName(d)})));

    }, []) // this function (likely) only needs to run on initialization. Is this a good way of making such a function?
    
    useEffect(() => {
      const re = /^[hHgG]\d{3,4}$/; // Strong's number pattern

      if(!re.test(searchQuery))
      {
        setValidQuery(false);
        return;
      }

      setValidQuery(true);
      const strongAtts = "attribute/spanWithAtts/w/strong/0/";
      const query = 
        `{
          document(id: "${docId}" ) {
            cvMatching( withScopes:["${strongAtts}${searchQuery.toUpperCase()}"]) {
              scopeLabels text
            }
          }
        }`;

        // Syntax like this should work when querying for multiple strong's numbers
        // cvMatching( withScopes:["${strongAtts}${searchQuery[0]}", "${strongAtts}${searchQuery[1]}"]) {

        const result = pk.gqlQuerySync(query);

        setMatches(result.data.document.cvMatching.map(d => (
          {c: d.scopeLabels[1].replace(/\D/g,''), v: d.scopeLabels[2].replace(/\D/g,''), t: d.text}
          )));
    }, [searchQuery]);

    return (
        <Grid container>
            <Grid item xs={12} sm={4} md={7} lg={8}>
              <DocSelector
                  docs={docMenuItems}
                  docId={docId}
                  setDocId={setDocId}
              />
            </Grid>
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
                  !validQuery ? <Typography>Enter valid Strong's number in search box...</Typography> :
                  matches.length === 0 ?
                  <Typography>There are no occurrences of this Strong's number in the selected book...</Typography> :
                  <Typography>Results found, but we'll have to work on how to display them...</Typography>
                }
            </Grid>
        </Grid>
    )
}
