import React, {useContext, useState, useEffect} from 'react';
import {TextField, Grid, Checkbox} from "@mui/material";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import DocSelector from "./DocSelector";

export default function SearchScripture({pk}) {

    const appLang = useContext(AppLangContext);
    const searchTitle = i18n(appLang, "CONTROLS_SEARCH");
    const allBooksTitle = i18n(appLang, "CONTROLS_ALLBOOKS");
    const matchAllTitle = i18n(appLang, "CONTROLS_MATCHALL");

    const [docId, setDocId] = useState("");
    const [docMenuItems, setDocMenuItems] = useState([]);
    const [searchEntireBible, setSearchEntireBible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [matchAll, setMatchAll] = useState(false);
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
      if (searchQuery.length === 0)
      {
        setValidQuery(false);
        setMatches([]);
        return;
      }

      let strongsNums = searchQuery.split(',');

      const re = /^[hHgG]\d{3,4}$/; // Strong's number pattern

      for (let id = 0; id < strongsNums.length; id++) {
        if(!re.test(strongsNums[id]))
        {
          setValidQuery(false);
          setMatches([]);
          return;
        }        
      }
      
      if(!docId || docId === "pleaseChoose")
      {
        setMatches([]);
        return;
      }

      setValidQuery(true);
      const strongAtts = "attribute/spanWithAtts/w/strong/0/";

      strongsNums.forEach((num, id) => {
        strongsNums[id] = "\""+strongAtts+num.toUpperCase()+"\"";
      });

      const scopes = strongsNums.join(", ");

      const matchAllString = matchAll ? "true" : "false";
      
      const queryCore = 
      `cvMatching( withScopes:[${scopes}] allScopes:${matchAllString}) {
        scopeLabels
        tokens {
          payload
          scopes( startsWith: "${strongAtts}")
        }
      }`

      const bibleQuery = 
      `{
        documents(sortedBy:"paratext") {
          id
          ${queryCore}
        }
      }`;

      const singleBookQuery = 
      `{
        document(id: "${docId}" ) {
          id
          ${queryCore}
        }
      }`;

      const result = pk.gqlQuerySync(searchEntireBible?bibleQuery:singleBookQuery);

      if(searchEntireBible)
      {
        let matches = [];
        result.data.documents.forEach(doc => {
          doc.cvMatching.map(match => (
            matches.push({
              b: docMenuItems.find((d) => d.id === doc.id).label, c: findValueForLabel(match.scopeLabels, /chapter/),
              v: findValueForLabel(match.scopeLabels, /verse/), t: match.tokens
            })
          ))
        });
        setMatches(matches);
      }
      else
      {
        setMatches(result.data.document.cvMatching.map(match => ({
          b: docMenuItems.find((d) => d.id === docId).label, c: findValueForLabel(match.scopeLabels, /chapter/),
          v: findValueForLabel(match.scopeLabels, /verse/), t: match.tokens
        })));
      }
    }, [searchEntireBible, searchQuery, docId, matchAll]);

    // This could be some kind of utility function
    const findValueForLabel = (scopeLabels, label) => {
      for (var i=0; i<scopeLabels.length; i++) {
        if (label.test(scopeLabels[i])) return scopeLabels[i].replace(/\D/g,'');
      }
    }

    const isTokenStrongsInQuery = (token) => {
      const strongsInQuery = searchQuery.toUpperCase().split(',');

      for (let id = 0; id < strongsInQuery.length; id++) {
        if(token.includes(strongsInQuery[id]))
        {
          return true;
        }
      }
      return false;
    }

    return (
      <Grid container>
        <Grid item xs={6} sm={3} md={2} lg={2}>
          <DocSelector
            docs={docMenuItems}
            docId={docId}
            setDocId={setDocId}
            disabled={searchEntireBible}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={3} lg={5}>
          <Checkbox
            checked={searchEntireBible}
            value={searchEntireBible}
            onChange={(e) => setSearchEntireBible(!searchEntireBible)}
          />
        {allBooksTitle}
        </Grid>
        <Grid item xs={6} sm={3} md={4} lg={3}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            label={searchTitle}
            helperText="H1234,H2345,G3456"
          />
        </Grid>
        <Grid item xs={6} sm={3} md={3} lg={2}>
          <Checkbox
            checked={matchAll}
            value={matchAll}
            onChange={(e) => setMatchAll(!matchAll)}
          />
        {matchAllTitle}
        </Grid>
        <Grid item xs={12}>
            {
              !validQuery ? <p>Enter valid Strong's number(s) in search box...</p> :
              matches.length === 0 ? <p>There are no occurrences of this Strong's number in the selected book...</p> :
              <div>
                <p>{matches.length} occurrences found:</p>
                <ul>
                  {matches.map(match => {
                    return <li>{match.b + " " + match.c + ":" + match.v}<br />
                      {match.t.map(token => {
                        return token.scopes.length === 1 ? isTokenStrongsInQuery(token.scopes[0]) ?
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
