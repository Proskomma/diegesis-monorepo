import React, {useContext, useEffect, useState} from "react";
import {Grid, Typography,} from "@mui/material";
import AppLangContext from "../contexts/AppLangContext";
import {directionText, FontFamily} from "../i18n/languageDirection";

export default function BrowseBcvNotes({pk}) {
    const appLang = useContext(AppLangContext);

    const [notesData, setNotesData] = useState({
        ref: "3:16",
    });
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const docQuery =
            `{
          documents {
            tableSequences {
              rows(matches:[{colN:0 matching:"""%ref%"""}]) {
                text
              }
            }
          }
        }`.replace("%ref%", notesData.ref);
        console.log(docQuery);
        const result = pk.gqlQuerySync(docQuery);
        console.log(result);
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
                {rows.map((r, n) => <Typography key={n}>{JSON.stringify(r)}</Typography>)}
            </Grid>
        </Grid>
    );
}
