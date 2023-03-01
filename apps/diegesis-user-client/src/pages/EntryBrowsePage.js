import React, { useContext, useState } from "react";
import { Container, Typography, Box, Button} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Proskomma } from "proskomma-core";
import GqlError from "../components/GqlError";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import BrowseScripture from "../components/BrowseScripture";
import { directionText, setFontFamily } from "../i18n/languageDirection";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import SearchModal from "../components/SearchModal";
import PrintModal from "../components/PrintModal";
import PrintIcon from '@mui/icons-material/Print';

export default function EntryBrowsePage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const { source, entryId, revision } = useParams();

  const [openSearchModal, setOpenSearchModal] = useState(false);
  const handleOpenSearchModal = () => setOpenSearchModal(true);
  const handleCloseSearchModal = () => setOpenSearchModal(false);

  const [openPrintModal, setOpenPrintModal] = useState(false);
  const handleOpenPrintModal = () => setOpenPrintModal(true);
  const handleClosePrintModal = () => setOpenPrintModal(false);

    const [docId, setDocId] = useState(null);

    const queryString = `query {
            localEntry(
              source: """%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              language
              title
              canonResource(type:"succinct") {content}
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

  const setArrow = (lang) => {
    if (directionText(lang) === "ltr") {
      return <ArrowBack color="primary" />;
    }
    if (directionText(lang) === "rtl") {
      return <ArrowForward color="primary" />;
    }
  };

  if (!entryInfo) {
    return (
      <Container fixed className="homepage">
        <Header selected="list" />
        <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            <Button>
              <RouterLink
                to={`/entry/details/${source}/${entryId}/${revision}`}
              >
                {setArrow(appLang)}
              </RouterLink>
            </Button>
            {i18n(appLang, "PROCESSING")}
          </Typography>
          <Typography paragraph="true">
            {i18n(appLang, "BROWSE_PAGE_CURRENTLY_WARNING")}
          </Typography>
        </Box>
      </Container>
    );
  }

  const pk = new Proskomma([
    {
      name: "source",
      type: "string",
      regex: "^[^\\s]+$",
    },
    {
      name: "project",
      type: "string",
      regex: "^[^\\s]+$",
    },
    {
      name: "revision",
      type: "string",
      regex: "^[^\\s]+$",
    },
  ]);

  if (entryInfo?.canonResource?.content) {
    pk.loadSuccinctDocSet(JSON.parse(entryInfo.canonResource.content));
  }

  return (
    <Container fixed className="homepage">
      <Header setAppLanguage={setAppLanguage} selected="list" />
      <Box style={{ marginTop: "100px" }}>
        <Typography
          dir={directionText(appLang)}
          variant="h4"
          paragraph="true"
          sx={{ mt: "20px" }}
          style={{ fontFamily: setFontFamily(appLang) }}
        >
          <Button>
            <RouterLink to={`/entry/details/${source}/${entryId}/${revision}`}>
              {setArrow(appLang)}
            </RouterLink>
          </Button>
          {entryInfo && entryInfo.title}
          {!entryInfo && "Loading..."}
          <Button onClick={handleOpenSearchModal}>
              <SearchIcon color="primary" sx={{ fontSize: 30 }} />
          </Button>
          <SearchModal openSearchModal={openSearchModal} handleCloseSearchModal={handleCloseSearchModal} pk={pk}/>
          <Button onClick={handleOpenPrintModal}>
            <PrintIcon color="primary"sx={{ fontSize: 30 }}/>
          </Button>
          <PrintModal
              openPrintModal={openPrintModal}
              handleClosePrintModal={handleClosePrintModal}
              pk={pk}
              docId={docId}
          />
        </Typography>
        {entryInfo &&
          entryInfo.canonResource &&
          entryInfo.canonResource.content && <BrowseScripture pk={pk} docId={docId} setDocId={setDocId}/>}
        {(!entryInfo ||
          !entryInfo.canonResource ||
          !entryInfo.canonResource.content) && (
          <Typography
            paragraph="true"
            style={{ fontFamily: setFontFamily(appLang) }}
          >
            {i18n(appLang, "BROWSE_PAGE_YET_WARNING")}
          </Typography>
        )}
        <Footer />
      </Box>
    </Container>
  );
}
