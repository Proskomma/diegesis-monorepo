import React, { useContext, useState } from "react";
import { Container, Typography, TableContainer } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText, fontFamily } from "../i18n/languageDirection";
import AddTabsHeader from "../components/AddTabsHeader";
import ScriptureUsfmForm from "../components/ScriptureUsfmForm";
import UwNotesForm from "../components/UwNotesForm";

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Container fixed className="upload-page">
      <Header setAppLanguage={setAppLanguage} selected="add" />
      <Typography
        dir={directionText(appLang)}
        variant="h4"
        paragraph="true"
        sx={{ mt: "100px" }}
        style={{ fontFamily: fontFamily(appLang) }}
      >
        {i18n(appLang, "Add_Document")}
      </Typography>

      <TableContainer dir={directionText(appLang)}>
        <AddTabsHeader
          selectedTabIndex={selectedTabIndex}
          setSelectedTabIndex={setSelectedTabIndex}
        />
          {selectedTabIndex === 0 && <ScriptureUsfmForm />}
          {selectedTabIndex === 1 && <UwNotesForm />}
      </TableContainer>
      <Footer />
    </Container>
  );
}
