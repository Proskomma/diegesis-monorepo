import {Container, Typography, Grid, Box, Button} from "@mui/material";
import {useParams, Link as RouterLink} from "react-router-dom";
import {ArrowBack} from '@mui/icons-material';
import {gql, useQuery} from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";

export default function EntryDetailsPage() {

    const {source, entryId, revision} = useParams();

    const queryString =
        `query {
          org(name:"""%source%""") {
            localEntry(
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              languageCode
              title
              textDirection
              script
              copyright
              abbreviation
              owner
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

    return <Container fixed className="homepage">
        <Header selected="list"/>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                <Button>
                    <RouterLink to={`/entry/browse/${source}/${entryId}/${revision}`} relative="path"><ArrowBack/></RouterLink></Button>
                {entryInfo.title}
            </Typography>
            <Typography variant="h5" paragraph="true">Details</Typography>
            <Grid container>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Abbreviation</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{entryInfo.abbreviation}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Copyright</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{entryInfo.copyright}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Language</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">
                        {entryInfo.languageCode}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">
                        {entryInfo.textDirection ? entryInfo.textDirection : ""}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">
                        {entryInfo.script ? entryInfo.script : ""}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Data Source</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{source}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Owner</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{entryInfo.owner}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Entry ID</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{entryId}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body1" paragraph="true">Revision</Typography>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="body1" paragraph="true">{revision}</Typography>
                </Grid>
            </Grid>
            <Footer/>
        </Box>
    </Container>;

}
