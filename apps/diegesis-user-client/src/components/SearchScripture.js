import React, {useContext, useState, useEffect} from 'react';
import {Typography, TextField, Grid, Switch, FormGroup, FormControlLabel, Box, Button} from "@mui/material";
import {Tune} from '@mui/icons-material';
import {SofriaRenderFromProskomma} from "proskomma-json-tools";
import sofria2WebActions from '../renderer/sofria2web';
import DocSelector from "./DocSelector";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";

export default function SearchScripture({pk}) {

    const appLang = useContext(AppLangContext);
    const searchTitle = i18n(appLang, "CONTROLS_SEARCH");

    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
      const docIdsStruct = pk.gqlQuerySync(
        `{
          docSets {
            documents(sortedBy:"paratext") {
              id
              headers { key value }
            }
          }
        }`);
      const docId = docIdsStruct.data.docSets[0].documents[0].id; // Just grab Genesis for now

      const seqIdsStruct = pk.gqlQuerySync(
        `{
          document(id: "${docId}" ) {
            sequences {
              id
            }
          }
        }`);
      const seqIds = seqIdsStruct.data.document.sequences;
      const payloads = seqIds.map((seqId) => ( getPayloadsForSequence(docId, seqId.id)));
      console.log(payloads);
      // Search the payloads, and match for searchQuery


    }, [searchQuery]);

    const getPayloadsForSequence = (docId, seqId) => {    
        const payloads = [];
        const numBlocksStruct = pk.gqlQuerySync(
          `{
            document(id: "${docId}" ) {
              sequence(id: "${seqId}") {
                nBlocks
              }                 
            }   
          }`);
        const numBlocks = numBlocksStruct.data.document.sequence.nBlocks;
        for (let block = 0; block < numBlocks; block++) {
            const payloadStruct = pk.gqlQuerySync(
              `{
                document(id: "${docId}" ) {
                  sequence(id: "${seqId}") {
                    blocks(positions: ${block}) {
                      items {
                        payload
                      }
                    }
                  }                 
                }   
              }`);
            payloads.push(payloadStruct.data.document.sequence.blocks[0].items);
        }
        return payloads;
    }           

    const matches = [];

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
