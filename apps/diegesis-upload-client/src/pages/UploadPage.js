import React, { useContext, useState } from "react";
import { Container, Typography, TableContainer } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText, setFontFamily } from "../i18n/languageDirection";
import TableHeader from "../components/TableHeader";
import UsfmForm from "../components/UsfmForm";
import SfmForm from "../components/SfmForm";

export default function UploadPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);

  const [selectedTabIndex, setSelectedTabIndex] = useState("");

  console.log(selectedTabIndex);
  return (
    <Container fixed className="uploadpage">
      <Header setAppLanguage={setAppLanguage} selected="add" />
      <Typography
        dir={directionText(appLang)}
        variant="h4"
        paragraph="true"
        sx={{ mt: "100px" }}
        style={{ fontFamily: setFontFamily(appLang) }}
      >
        {i18n(appLang, "Add_Document")}
      </Typography>

      <TableContainer dir={directionText(appLang)}>
        {!selectedTabIndex && (
          <Typography style={{ fontFamily: setFontFamily(appLang) }}>
            {i18n(appLang, "SELECT_FILE_TYPE")} :
          </Typography>
        )}
        <TableHeader
          selectedTabIndex={selectedTabIndex}
          setSelectedTabIndex={setSelectedTabIndex}
        />
        {selectedTabIndex === "usfm" && <UsfmForm />}
        {selectedTabIndex === "sfm" && <SfmForm />}
      </TableContainer>
      <Footer />
    </Container>
  );
}
