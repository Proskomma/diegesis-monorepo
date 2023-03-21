import React, {useContext, useEffect, useState} from "react";
import {Grid, TextField, Typography} from "@mui/material";
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
        const refTest = /^[A-Z1-6]{3} [0-9]+:[0-9]+$/;
        if (!refTest.test(notesData.ref)) {
            return;
        }
        const docQuery =
            `{
          documents {
            bookCode: header(id:"bookCode")
            tableSequences {
              rows(equals:[{colN:0 values:"""%ref%"""}]) {
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
            <Grid item xs={12}>
                <TextField
                    value={notesData.ref}
                    onChange={(e) => setNotesData({...notesData, ref: e.target.value})}
                    label={"Reference"}
                    size="small"
                    id="searchReference"
                    variant="filled"
                    color="primary"
                />
            </Grid>
            {
                rows.length > 0 && [
                    <Grid item xs={1}><Typography variant="h6">ID</Typography></Grid>,
                    <Grid item xs={2}><Typography variant="h6">Start</Typography></Grid>,
                    <Grid item xs={2}><Typography variant="h6">End</Typography></Grid>,
                    <Grid item xs={7}><Typography variant="h6">Content</Typography></Grid>
                ]
            }
            {
                rows.map(
                    (r, n) => [
                        <Grid item xs={1} key={n}>{r[2]}</Grid>,
                        <Grid item xs={2} key={`${n}_bis`}>{r[0]}</Grid>,
                        <Grid item xs={2} key={`${n}_ter`}>{r[1]}</Grid>,
                        <Grid item xs={7} key={`${n}_quad`}>
                            <ReactMarkdown>
                                {r[3].replace(/\(See:[^)]+\)/g, "")}
                            </ReactMarkdown>
                        </Grid>,
                    ]
                )
            }
        </Grid>
    );
}
