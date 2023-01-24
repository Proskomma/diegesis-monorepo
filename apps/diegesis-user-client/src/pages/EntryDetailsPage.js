import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { ArrowBack, AutoStories, Download } from "@mui/icons-material";
import { gql, useQuery } from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BookSelector from "../components/BookSelector";

import AppLangContext from "../contexts/AppLangContext";
import { directionText, alignmentText } from "../i18n/languageDirection";
import { useContext, useState } from "react";
import i18n from "../i18n";

export default function EntryDetailsPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const { source, entryId, revision } = useParams();
  const [selectedBook, setSelectedBook] = useState("");

  const queryString = `query {
            localEntry(
              source:"""%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
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

  const { loading, error, data } = useQuery(
    gql`
      ${queryString}
    `
  );

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <GqlError error={error} />;
  }

  const entryInfo = data.localEntry;

  const details = i18n(appLang, "ADMIN_DETAILS");
  const abbreviation = i18n(appLang, "ADMIN_DETAILS_ABBREVIATION");
  const copyright = i18n(appLang, "ADMIN_DETAILS_COPYRIGHT");
  const language = i18n(appLang, "ADMIN_DETAILS_LANGUAGE");
  const dataSource = i18n(appLang, "ADMIN_DETAILS_DATA_SOURCE");
  const owner = i18n(appLang, "ADMIN_DETAILS_OWNER");
  const detailsEntryId = i18n(appLang, "ADMIN_DETAILS_ENTRY_ID");
  const detailsRevision = i18n(appLang, "ADMIN_DETAILS_REVISION");
  const directionDuText = i18n(appLang, "ADMIN_TEXT_DIRECTION");
  const finalScript = i18n(appLang, "ADMIN_LANGUAGE_SCRIPT", [
    entryInfo.script,
  ]);
  const content = i18n(appLang, "ADMIN_DETAILS_CONTENT");
  const chapters = i18n(appLang, "ADMIN_DETAILS_CHAPTERS");
  const verses = i18n(appLang, "ADMIN_DETAILS_VERSES");
  const sTitle = i18n(appLang, "ADMIN_DETAILS_TITLE");
  const alert = i18n(appLang, "ADMIN_DETAILS_ALERT");

  let bookCodes;
  if (entryInfo.bookCodes.length > 0) {
    bookCodes = [...entryInfo.bookCodes];
  }

  const filteredStatsTab = entryInfo.bookStats.filter((bo) => bo.stat > 0);

  return (
    <Container fixed className="homepage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
        <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
          <Button>
            <RouterLink to="/list" relative="path">
              <ArrowBack />
            </RouterLink>
          </Button>
          {entryInfo.title}
          <Button>
            <RouterLink to={`/entry/browse/${source}/${entryId}/${revision}`}>
              <AutoStories />
            </RouterLink>
          </Button>
          <Button>
            <RouterLink to={`/entry/download/${source}/${entryId}/${revision}`}>
              <Download />
            </RouterLink>
          </Button>
        </Typography>
        <Paper className="container">
          <Typography variant="h4" paragraph="true">
            {details}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{abbreviation}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{entryInfo.abbreviation}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{copyright}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{entryInfo.copyright}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{language}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>
                {entryInfo.language}
                {`, ${directionDuText}`}
                {entryInfo.script ? `, ${finalScript}` : ""}
              </Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{dataSource}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{source}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{owner}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{entryInfo.owner}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{detailsEntryId}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{entryId}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                {" "}
                <span dir={directionText(appLang)}>{detailsRevision}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{revision}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{content}</span>
              </Grid>
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{`${entryInfo.nOT} OT, ${entryInfo.nNT} NT, ${entryInfo.nDC} DC`}</Grid>
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                {" "}
                <span dir={directionText(appLang)}>{chapters}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{`${entryInfo.nChapters}`}</Grid >
            </Grid>
            <Grid
              item
              xs={4}
              style={{ fontWeight: "bold", textAlign: alignmentText(appLang) }}
            >
              <Grid item>
                <span dir={directionText(appLang)}>{verses}</span>
              </Grid >
            </Grid>
            <Grid item xs={8} style={{ textAlign: alignmentText(appLang) }}>
              <Grid item>{`${entryInfo.nVerses}`}</Grid >
            </Grid>
          </Grid>
          <Grid container>
            {bookCodes.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
                    {sTitle}
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
            <>
              {selectedBook !== "" && (
                filteredStatsTab.map((bo) => (
                  <>
                    <Grid item xs={4} md={2}>
                      {i18n(appLang,`STATS_${bo.field}`)}
                    </Grid>
                    <Grid item xs={8} md={10}>
                      {bo.stat}
                    </Grid>
                  </>
                ))
              )}
              {selectedBook === "" && (
                <Typography style={{ textAlign: alignmentText(appLang) }}>
                  {alert}
                </Typography>
              )}
            </>
          </Grid>
        </Paper>
        <Footer />
      </Box>
    </Container>
  );
}