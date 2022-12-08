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

    const {source, owner, entryId, revision} = useParams();

    const client = useApolloClient();

    const downloadSuccinct = async () => {
        const queryString = `query {
            org(name:"""%source%""") {
              localTranslation(
                owner: """%owner%"""
                id: """%entryId%"""
                revision: """%revision%"""
              ) {
                succinct
              }
            }
          }`
            .replace("%source%", source)
            .replace("%owner%", owner)
            .replace("%entryId%", entryId)
            .replace("%revision%", revision);
        const query = gql`${queryString}`;
        const result = await client.query({query});
        const element = document.createElement("a");
        const file = new Blob([result.data.org.localTranslation.succinct], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${source}_${owner}_${entryId}_${revision}_succinct.json`;
        document.body.appendChild(element);
        element.click();
    }


    const queryString =
        `query {
          org(name:"""%source%""") {
            localTranslation(
              owner: """%owner%"""
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
            .replace("%owner%", owner)
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

    const translationInfo = data.org.localTranslation;

    let bookCodes;
    if (translationInfo.usfmBookCodes.length > 0) {
        bookCodes = [...translationInfo.usfmBookCodes];
    } else {
        bookCodes = [...translationInfo.usxBookCodes];
    }

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to="/list"><ArrowBack/></RouterLink></Button>
                {translationInfo.title}
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5" paragraph="true">Download by Translation</Typography>
                </Grid>
                {
                    translationInfo.hasSuccinct &&
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" paragraph="true">Proskomma Succinct</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" paragraph="true">
                                <Button onClick={downloadSuccinct}>
                                    <Download/>
                                </Button>
                            </Typography>
                        </Grid>
                    </>
                }
                {
                    translationInfo.hasVrs &&
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" paragraph="true">Versification</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" paragraph="true"><Button><Download/></Button></Typography>
                        </Grid>
                    </>
                }
                {
                    bookCodes.length > 0 &&
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h5" paragraph="true">Download by Book</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1" paragraph="true">Book Code</Typography>
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
                            <Typography variant="body1" paragraph="true">SOFRIA</Typography>
                        </Grid>
                        {
                            bookCodes.map(b =>
                                <>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" paragraph="true">{b}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button disabled={!translationInfo.hasUsfm}><Download/></Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button disabled={!translationInfo.hasUsx}><Download/></Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button disabled={!translationInfo.hasPerf}><Download/></Button>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="body1" paragraph="true">
                                            <Button disabled={!translationInfo.hasSofria}><Download/></Button>
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
