import React from "react";
import {Container, Typography, Grid, Box, Button} from "@mui/material";
import {useParams, Link as RouterLink} from "react-router-dom";
import {ArrowBack, Download} from '@mui/icons-material';
import {gql, useQuery, useApolloClient} from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";

export default function EntryDownloadPage() {

    const {source, entryId, revision} = useParams();

    const client = useApolloClient();

    const downloadTranslation = async downloadType => {
        const downloadTypes = {
            succinct: {
                mime: "application/json",
                suffix: "succinct.json"
            },
            vrs: {
                mime: "text/plain",
                suffix: "vrs.txt"
            }
        }
        if (!downloadTypes[downloadType]) {
            console.log(`Unknown Download Translation Type ${downloadType}`);
            return;
        }
        const queryString = `query {
            org(name:"""%source%""") {
              localEntry(
                id: """%entryId%"""
                revision: """%revision%"""
              ) {
                %downloadType%
              }
            }
          }`
            .replace("%source%", source)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision)
            .replace("%downloadType%", downloadType);
        const query = gql`${queryString}`;
        const result = await client.query({query});
        const element = document.createElement("a");
        const file = new Blob([result.data.org.localEntry[downloadType]], {type: downloadTypes[downloadType].mime});
        element.href = URL.createObjectURL(file);
        element.download = `${source}_${entryId}_${revision}_${downloadTypes[downloadType].suffix}`;
        document.body.appendChild(element);
        element.click();
    }

    const downloadBook = async (downloadType, bookCode) => {
        const downloadTypes = {
            usfm: {
                mime: "text/plain",
                suffix: "usfm.txt"
            },
            usx: {
                mime: "text/xml",
                suffix: "usx.xml"
            },
            perf: {
                mime: "application/json",
                suffix: "perf.json"
            },
            simplePerf: {
                mime: "application/json",
                suffix: "simple_perf.json"
            },
            sofria: {
                mime: "application/json",
                suffix: "sofria.json"
            }
        }
        if (!downloadTypes[downloadType]) {
            console.log(`Unknown Download Book Type ${downloadType}`);
            return;
        }
        const queryString = `query {
            org(name:"""%source%""") {
              localEntry(
                id: """%entryId%"""
                revision: """%revision%"""
              ) {
                download: %downloadType%ForBookCode(code: """%bookCode%""")
              }
            }
          }`
            .replace("%source%", source)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision)
            .replace("%downloadType%", downloadType)
            .replace("%bookCode%", bookCode);
        const query = gql`${queryString}`;
        const result = await client.query({query});
        const element = document.createElement("a");
        const file = new Blob([result.data.org.localEntry.download], {type: downloadTypes[downloadType].mime});
        element.href = URL.createObjectURL(file);
        element.download = `${source}_${entryId}_${revision}_${bookCode}_${downloadTypes[downloadType].suffix}`;
        document.body.appendChild(element);
        element.click();
    }

    const queryString =
        `query {
          org(name:"""%source%""") {
            localEntry(
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              usfmBookCodes
              usxBookCodes
              hasSuccinct
              hasUsfm
              hasUsx
              hasPerf
              hasSofria
              hasVrs
              title
            }
          }
        }`
            .replace("%source%", source)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision);

    const {loading, error, data} = useQuery(
        gql`${queryString}`,
    );

    if (loading) {
        return <Spinner/>
    }
    if (error) {
        return <GqlError error={error}/>
    }

    const entryInfo = data.org.localEntry;

    let bookCodes;
    if (entryInfo.usfmBookCodes.length > 0) {
        bookCodes = [...entryInfo.usfmBookCodes];
    } else {
        bookCodes = [...entryInfo.usxBookCodes];
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to={`/entry/browse/${source}/${entryId}/${revision}`} relative="path"><ArrowBack/></RouterLink></Button>
                {entryInfo.title}
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5" paragraph="true">Download by Translation</Typography>
                </Grid>
                {
                    entryInfo.hasSuccinct &&
                    <>
                        <Grid item xs={4}>
                            <Typography variant="body1" paragraph="true">Proskomma Succinct</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body1" paragraph="true">
                                <Button onClick={() => downloadTranslation("succinct")}>
                                    <Download/>
                                </Button>
                            </Typography>
                        </Grid>
                    </>
                }
                {
                    entryInfo.hasVrs &&
                    <>
                        <Grid item xs={4}>
                            <Typography variant="body1" paragraph="true">Versification</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body1" paragraph="true">
                                <Button onClick={() => downloadTranslation("vrs")}>
                                    <Download/>
                                </Button>
                            </Typography>
                        </Grid>
                    </>
                }
                {
                    bookCodes.length > 0 &&
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h5" paragraph="true">Download by Book</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">Book</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">USFM</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">USX</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">PERF</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">sPERF</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="body1" paragraph="true">SOFRIA</Typography>
                        </Grid>
                        {
                            bookCodes.map(b =>
                                <>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">{b}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button
                                                onClick={() => downloadBook("usfm", b)}
                                                disabled={!entryInfo.hasUsfm}
                                            >
                                                <Download/>
                                            </Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button
                                                onClick={() => downloadBook("usx", b)}
                                                disabled={!entryInfo.hasUsx}
                                            >
                                                <Download/>
                                            </Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button
                                                onClick={() => downloadBook("perf", b)}
                                                disabled={!entryInfo.hasPerf}
                                            >
                                                <Download/>
                                            </Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button
                                                onClick={() => downloadBook("simplePerf", b)}
                                                disabled={!entryInfo.hasPerf}
                                            >
                                                <Download/>
                                            </Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button
                                                onClick={() => downloadBook("sofria", b)}
                                                disabled={!entryInfo.hasSofria}
                                            >
                                                <Download/>
                                            </Button>
                                        </Typography>
                                    </Grid>
                                </>
                            )
                        }
                    </>

                }
            </Grid>
            <Footer/>
        </Box>
    </Container>;

}
