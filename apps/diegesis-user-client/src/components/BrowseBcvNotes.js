import React, {useContext, useEffect, useState} from "react";
import {Grid, TextField} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import AppLangContext from "../contexts/AppLangContext";
import {directionText, FontFamily} from "../i18n/languageDirection";

export default function BrowseBcvNotes({pk}) {
    const appLang = useContext(AppLangContext);

    const [notesData, setNotesData] = useState({
        ref: "JHN 3:16",
    });
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (notesData.length < 5) {
            return;
        }
        const docQuery =
            `{
          documents {
            tableSequences {
              rows(equals:[{colN:0 values:"""%ref%"""}], columns: [0, 1, 6]) {
                text
              }
            }
          }
        }`.replace("%ref%", notesData.ref);
        const result = pk.gqlQuerySync(docQuery);
        if (result.data) {
            setRows(
                result.data.documents[0]
                    .tableSequences[0]
                    .rows
                    .map(
                        r => r
                            .map(c => c.text)
                    )
            )
        }
    }, [notesData]);
    return (
        <Grid
            container
            dir={directionText(appLang)}
            style={{fontFamily: FontFamily(appLang)}}
        >
            <Grid item>BCV Notes</Grid>
            <Grid item xs={12}>
                <TextField
                    value={notesData.ref}
                    onChange={(e) => setNotesData({...notesData, ref:e.target.value})}
                    label={"Reference"}
                    size="small"
                    id="searchReference"
                    variant="filled"
                    color="primary"
                />
            </Grid>
            {
                rows.map(
                    (r, n) => [
                        <Grid item xs={2} key={n}>{r[0]}</Grid>,
                        <Grid item xs={2} key={`${n}_bis`}>{r[1]}</Grid>,
                        <Grid item xs={8} key={`${n}_ter`}>
                            <ReactMarkdown>
                                {r[2].replace(/\(See:[^)]+\)/g, "")}
                            </ReactMarkdown>
                        </Grid>,
                    ]
                )
            }
        </Grid>
    );
}
