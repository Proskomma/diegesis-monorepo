import React, {useState} from "react";
import {Container, Typography, Grid, Box, Button} from "@mui/material";
import {useParams, Link as RouterLink} from "react-router-dom";
import {ArrowBack, Download} from '@mui/icons-material';
import {gql, useQuery, useApolloClient} from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BookSelector from "../components/BookSelector";

export default function EntryDownloadPage() {

    const {source, entryId, revision} = useParams();

    const [selectedBook, setSelectedBook] = useState("");

    const client = useApolloClient();

    const downloadTranslation = async downloadType => {
        const downloadTypes = {
            succinct: {
                mime: "application/json",
                suffix: "succinct.json"
            },
            versification: {
                mime: "text/plain",
                suffix: "vrs.txt"
            }
        }
        if (!downloadTypes[downloadType]) {
            console.log(`Unknown Download Translation Type ${downloadType}`);
            return;
        }
        const queryString = `query {
              localEntry(
                source: """%source%"""
                id: """%entryId%"""
                revision: """%revision%"""
              ) {
                canonResource(type: """%downloadType%""") {content}
              }
            }`
            .replace("%source%", source)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision)
            .replace("%downloadType%", downloadType);
        const query = gql`${queryString}`;
        const result = await client.query({query});
        const element = document.createElement("a");
        const file = new Blob([result.data.localEntry.canonResource.content], {type: downloadTypes[downloadType].mime});
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
              localEntry(
                source: """%source%"""
                id: """%entryId%"""
                revision: """%revision%"""
              ) {
                download: bookResource(bookCode: """%bookCode%""" type: """%downloadType%""") {content}
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
        const file = new Blob([result.data.localEntry.download.content], {type: downloadTypes[downloadType].mime});
        element.href = URL.createObjectURL(file);
        element.download = `${source}_${entryId}_${revision}_${bookCode}_${downloadTypes[downloadType].suffix}`;
        document.body.appendChild(element);
        element.click();
    }

    const queryString =
        `query {
            localEntry(
              source: """%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              title
              usfmBookCodes: bookCodes(type:"usfm")
              usxBookCodes: bookCodes(type: "usx")
              perfBookCodes: bookCodes(type: "perf")
              simplePerfBookCodes: bookCodes(type: "simplePerf")
              sofriaBookCodes: bookCodes(type: "sofria")
              succinctRecord: canonResource(type:"succinct") {type}
              vrsRecord: canonResource(type:"versification") {type}
              bookResourceTypes
              canonResources {type}
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

    const entryInfo = data.localEntry;

    let bookCodes = [];
    if (entryInfo.usfmBookCodes.length > 0) {
        bookCodes = [...entryInfo.usfmBookCodes];
    } else if (entryInfo.usxBookCodes.length > 0) {
        bookCodes = [...entryInfo.usxBookCodes];
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}
                                relative="path"><ArrowBack/></RouterLink></Button>
                {entryInfo.title}
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5" paragraph="true">Canon-level Resources</Typography>
                </Grid>
                {
                    entryInfo.canonResources
                        .map(cro => cro.type)
                        .map(
                        cr => <>
                            <Grid item xs={4}>
                                <Typography variant="body1" paragraph="true">{cr}</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                    <Button onClick={() => downloadTranslation(cr)}>
                                        <Download/>
                                    </Button>
                            </Grid>
                        </>

                    )
                }
                {
                    bookCodes.length > 0 &&
                    <>
                        <Grid item xs={4} md={2}>
                            <Typography variant="h5" paragraph="true">Book Resources</Typography>
                        </Grid>
                        <Grid item xs={8} md={10}>
                            <BookSelector bookCodes={bookCodes} selectedBook={selectedBook}
                                          setSelectedBook={setSelectedBook}/>
                        </Grid>
                        {
                            selectedBook !== "" &&
                            entryInfo.bookResourceTypes
                                .map(
                                rt => <>
                                    <Grid item xs={4}>
                                        {rt}
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Button
                                            onClick={() => downloadBook(rt, selectedBook)}
                                            disabled={!entryInfo[`${rt}BookCodes`].includes(selectedBook)}
                                        >
                                            <Download/>
                                        </Button>
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
