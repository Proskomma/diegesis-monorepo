import {Container, Typography, Box, Button, Paper, Grid} from "@mui/material";
import {useParams, Link as RouterLink} from "react-router-dom";
import {ArrowBack, ArrowForward, AutoStories, Download} from "@mui/icons-material";
import {gql, useQuery} from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BookSelector from "../components/BookSelector";

import AppLangContext from "../contexts/AppLangContext";
import {
    directionText,
    alignmentText,
    getAutonym,
    fontFamily
} from "../i18n/languageDirection";
import {useContext, useState} from "react";
import i18n from "../i18n";

export default function EntryDetailsPage({setAppLanguage}) {
    const appLang = useContext(AppLangContext);
    const {source, entryId, revision} = useParams();
    const [selectedBook, setSelectedBook] = useState("");

    const queryString = `query {
            localEntry(
              source:"""%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              types
              language
              title
              textDirection
              script
              copyright
              abbreviation
              owner
              nOT : stat(field :"nOT")
              nNT : stat(field :"nNT")
              nDC : stat(field :"nDC")
              nChapters : stat(field :"nChapters")
              nVerses : stat(field :"nVerses")
              bookStats(bookCode: "%bookCode%"){
                stat
                field
              }
              bookCodes
            }
          }`
        .replace("%source%", source)
        .replace("%entryId%", entryId)
        .replace("%revision%", revision)
        .replace("%bookCode%", selectedBook);

    const {loading, error, data} = useQuery(
        gql`
      ${queryString}
    `
    );
    if (loading) {
        return <Spinner/>;
    }
    if (error) {
        return <GqlError error={error}/>;
    }

    const entryInfo = data.localEntry;

    const setArrow = (lang) => {
        if (directionText(lang) === "ltr") {
            return <ArrowBack color="primary"/>;
        }
        if (directionText(lang) === "rtl") {
            return <ArrowForward color="primary"/>;
        }
    };

    if (!entryInfo) {
        return (
            <Container fixed className="homepage">
                <Header setAppLanguage={setAppLanguage} selected="list"/>
                <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
                    <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                        Processing on server - wait a while and hit "refresh"
                    </Typography>
                </Box>
            </Container>
        );
    }
    const finalScript = i18n(appLang, "ADMIN_LANGUAGE_SCRIPT", [
        entryInfo.script,
    ]);
    let bookCodes = [];
    if (entryInfo.bookCodes.length > 0) {
        bookCodes = [...entryInfo.bookCodes];
    }

    const filteredStatsTab = entryInfo.bookStats.filter((bo) => bo.stat > 0);

    let contentTab = [];
    for (const stat of ["OT", "NT", "DC"]) {
        if (entryInfo[`n${stat}`] > 0) {
            contentTab.push(`${entryInfo[`n${stat}`]} ${stat}`);
        }
    }
    const contentString = contentTab.join(", ");

    return (
        <Container fixed className="homepage">
            <Header setAppLanguage={setAppLanguage} selected="list"/>
            <Box dir={directionText(appLang)} style={{marginTop: "100px"}}>
                <Typography variant="h4" paragraph="true" sx={{mt: "20px"}} style={{fontFamily: fontFamily(appLang)}}>
                    <Button>
                        <RouterLink to="/list" relative="path">
                            {setArrow(appLang)}
                        </RouterLink>
                    </Button>
                    {entryInfo.title}
                    <Button>
                        <RouterLink to={`/entry/browse/${source}/${entryId}/${revision}`}>
                            <AutoStories color="primary"/>
                        </RouterLink>
                    </Button>
                    <Button>
                        <RouterLink to={`/entry/download/${source}/${entryId}/${revision}`}>
                            <Download color="primary"/>
                        </RouterLink>
                    </Button>
                </Typography>
                <Paper className="container">
                    <Typography variant="h5" paragraph="true" style={{fontFamily: fontFamily(appLang)}}>
                        {i18n(appLang, "ADMIN_DETAILS")}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_ABBREVIATION")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{entryInfo.abbreviation}</Grid>
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_COPYRIGHT")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{entryInfo.copyright}</Grid>
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_LANGUAGE")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            {getAutonym(entryInfo.language)}
                            {", "}
                            {entryInfo.textDirection === "rtl"
                                ? <span
                                    style={{fontFamily: fontFamily(appLang)}}>{i18n(appLang, "ADMIN_TEXT_DIRECTION_RIGHT")}</span>
                                : <span
                                    style={{fontFamily: fontFamily(appLang)}}>{i18n(appLang, "ADMIN_TEXT_DIRECTION_LEFT")}{', '}</span>
                            }
                            {entryInfo.script ?
                                <span style={{fontFamily: fontFamily(appLang)}}>{finalScript}</span> : ""}
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_DATA_SOURCE")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{source}</Grid>
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_OWNER")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{entryInfo.owner}</Grid>
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_ENTRY_ID")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{entryId}</Grid>
                        </Grid>
                        <Grid
                            item
                            xs={4}
                            style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                        >
                            {" "}
                            <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_REVISION")}
                </span>
                        </Grid>
                        <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                            <Grid item>{revision}</Grid>
                        </Grid>
                        {
                            entryInfo.types.includes('bible') &&
                            <>
                                <Grid
                                    item
                                    xs={4}
                                    style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                                >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_CONTENT")}
                </span>
                                </Grid>
                                <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                                    <Grid item>{contentString || "?"}</Grid>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                                >
                                    {" "}
                                    <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_CHAPTERS")}
                </span>
                                </Grid>
                                <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                                    <Grid item>{`${entryInfo.nChapters || "?"}`}</Grid>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    style={{fontWeight: "bold", textAlign: alignmentText(appLang)}}
                                >
                <span dir={directionText(appLang)} style={{fontFamily: fontFamily(appLang)}}>
                  {i18n(appLang, "ADMIN_DETAILS_VERSES")}
                </span>
                                </Grid>
                                <Grid item xs={8} style={{textAlign: alignmentText(appLang)}}>
                                    <Grid item>{`${entryInfo.nVerses || "?"}`}</Grid>
                                </Grid>
                            </>
                        }
                        {entryInfo.types.includes('bible') && bookCodes.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}
                                                style={{fontFamily: fontFamily(appLang)}}>
                                        {i18n(appLang, "ADMIN_DETAILS_TITLE")}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <BookSelector
                                        bookCodes={bookCodes}
                                        selectedBook={selectedBook}
                                        setSelectedBook={setSelectedBook}
                                    />
                                </Grid>
                            </>
                        )}
                        {entryInfo.types.includes('bible') && selectedBook !== "" &&
                        filteredStatsTab.map((bo) => (
                            <>
                                <Grid item xs={4} md={2} style={{fontFamily: fontFamily(appLang)}}>
                                    {i18n(appLang, `STATS_${bo.field}`)}
                                </Grid>
                                <Grid item xs={8} md={10}>
                                    {bo.stat}
                                </Grid>
                            </>
                        ))}
                        {entryInfo.types.includes('bible') && selectedBook === "" && bookCodes.length > 0 && (
                            <Grid item>
                                <Typography
                                    style={{textAlign: alignmentText(appLang), fontFamily: fontFamily(appLang)}}>
                                    {i18n(appLang, "ADMIN_DETAILS_ALERT")}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
                <Footer/>
            </Box>
        </Container>
    );
}
