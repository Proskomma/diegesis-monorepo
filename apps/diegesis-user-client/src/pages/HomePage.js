import { Container, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { i18nTables } from "../translations";
import i18n from "../translations";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";


export default function HomePage({setAppLanguage}) {
  
  const appLang = useContext(AppLangContext);
  console.log(appLang);
  const title = i18n(appLang,'HOME_TITLE')
  const phrase = i18n(appLang,'HOME_PHRASE')
  const content = i18n(appLang,'HOME_CONTENT')
  const here = i18n(appLang,'HOME_HERE')

  // console.log(i18nTables)

  return (
    <Container fixed className="homepage">
        <Header setAppLanguage={setAppLanguage} selected="home" />
        <Box style={{ marginTop: "100px" }}>
          <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
            Diegesis
          </Typography>
          <Typography variant="h6" paragraph="true">
            {title}
          </Typography>
          <Typography variant="body1" paragraph="true">
            {phrase}
          </Typography>
          <Typography variant="body1" paragraph="true">
            {content}<Link to="/list">{here}</Link>.
          </Typography>
          <Footer />
        </Box>
    </Container>
  );
}
