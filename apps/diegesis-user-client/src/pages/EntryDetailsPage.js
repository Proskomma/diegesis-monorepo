import {
  Container,
  Typography,
  TableRow,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  Paper,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { ArrowBack, AutoStories, Download } from "@mui/icons-material";
import { gql, useQuery } from "@apollo/client";
import GqlError from "../components/GqlError";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";

import AppLangContext from "../contexts/AppLangContext";
import { directionText, alignmentText } from "../i18n/languageDirection";
import { useContext } from "react";
import i18n from "../i18n";

export default function EntryDetailsPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const { source, entryId, revision } = useParams();

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
            }
          }`
    .replace("%source%", source)
    .replace("%entryId%", entryId)
    .replace("%revision%", revision);

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
  const script = i18n(appLang, "ADMIN_LANGUAGE_SCRIPT");
  const finalScript = i18n(appLang,"ADMIN_LANGUAGE_SCRIPT",[entryInfo.script])

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
          <Table aria-label="custom pagination table" container>
            <TableBody>
              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{abbreviation}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {entryInfo.abbreviation}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{copyright}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {entryInfo.copyright}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{language}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {entryInfo.language}
                    {`, ${directionDuText}`}
                    {entryInfo.script ? `, ${finalScript}` : ""}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{dataSource}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {source}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{owner}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {entryInfo.owner}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  item
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{detailsEntryId}</span>
                </TableCell>
                <TableCell
                  item
                  xs={8}
                  style={{ textAlign: alignmentText(appLang) }}
                >
                    {entryId}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>{detailsRevision}</span>
                </TableCell>
                <TableCell xs={8} style={{ textAlign: alignmentText(appLang) }}>
                    {revision}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  xs={4}
                  style={{
                    fontWeight: "bold",
                    textAlign: alignmentText(appLang),
                  }}
                >
                  <span dir={directionText(appLang)}>Content</span>
                </TableCell>
                <TableCell xs={8} style={{ textAlign: alignmentText(appLang) }}>
                    {`${entryInfo.nOT} OT, ${entryInfo.nNT} NT, ${entryInfo.nDC} DC`}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Footer />
      </Box>
    </Container>
  );
}
