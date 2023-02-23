import React, {useContext, useState, useEffect} from 'react';
import {TextField, Grid, Checkbox} from "@mui/material";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import DocSelector from "./DocSelector";

export default function SearchScripture({pk}) {

    const appLang = useContext(AppLangContext);
    const searchTitle = i18n(appLang, "CONTROLS_SEARCH");

    const [docId, setDocId] = useState("");
    const [docMenuItems, setDocMenuItems] = useState([]);
    const [searchEntireBible, setSearchEntireBible] = useState(false);
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
        setMatches([]);
        return;
      }


      if(!docId || docId === "pleaseChoose")
      {
        setMatches([]);
        return;
      }

      setValidQuery(true);
      const strongAtts = "attribute/spanWithAtts/w/strong/0/";

      const queryCore = 
      `cvMatching( withScopes:["${strongAtts}${searchQuery.toUpperCase()}"]) {
        scopeLabels
        tokens {
          payload
          scopes( startsWith: "${strongAtts}")
        }
      }`

      const singleBookQuery = 
        `{
          document(id: "${docId}" ) {
            ${queryCore}
          }
        }`;

      const bibleQuery = 
      `{
        docSets {
          documents(sortedBy:"paratext") {
            ${queryCore}
          }
        }
      }`;

      // Syntax like this should work when querying for multiple strong's numbers
      // cvMatching( withScopes:["${strongAtts}${searchQuery[0]}", "${strongAtts}${searchQuery[1]}"]) {

      const result = pk.gqlQuerySync(searchEntireBible?bibleQuery:singleBookQuery);

      console.log(result);

      setMatches(result.data.document.cvMatching.map(d => (
        {c: findValueForLabel(d.scopeLabels, /chapter/), v: findValueForLabel(d.scopeLabels, /verse/), t: d.tokens}
        )));
    }, [searchQuery, docId, searchEntireBible]);

    // This could be some kind of utility function
    const findValueForLabel = (scopeLabels, label) => {      
      for (var i=0; i<scopeLabels.length; i++) {
        if (label.test(scopeLabels[i])) return scopeLabels[i].replace(/\D/g,'');
      }
    }

    return (
        <Grid container>
            <Grid item xs={12} sm={3} md={2} lg={2}>
              <DocSelector
                  docs={docMenuItems}
                  docId={docId}
                  setDocId={setDocId}
                  disabled={searchEntireBible}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={6} lg={7}>
              <Checkbox
                  checked={searchEntireBible}
                  value={searchEntireBible}
                  onChange={(e) => setSearchEntireBible(!searchEntireBible)}
              />
              All books
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
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
                  !validQuery ? <p>Enter valid Strong's number in search box...</p> :
                  matches.length === 0 ?
                  <p>There are no occurrences of this Strong's number in the selected book...</p> :
                  <div>
                    <p>{matches.length} occurrences found:</p>
                    <ul>
                    {matches.map(match => {
                      return <li>{docMenuItems.find((doc) => doc.id === docId).label + " " + match.c + ":" + match.v}<br />
                        {match.t.map(token => {
                          return token.scopes.length === 1 ? token.scopes[0].includes(searchQuery.toUpperCase()) ?
                            <b>{token.payload}</b> : token.payload : token.payload
                        })}
                      </li>;
                    })}
                  </ul>
                  </div>                  
                }
            </Grid>
        </Grid>
    )
}
