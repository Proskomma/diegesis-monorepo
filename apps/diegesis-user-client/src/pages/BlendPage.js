import { Container, Typography, Box } from "@mui/material";
import XRegExp from "xregexp";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import { useContext } from "react";
import i18n from "../i18n";
import { directionText, FontFamily } from "../i18n/languageDirection";

const regex =
  /(("[A-Z0-9]{3}[ ]{1}[0-9]+:[0-9]+")|("[HG][0-9]{3,5}")|("[A-Z0-9]{3}[ ]{1}[0-9]+")|([A-Za-z]+))/;
export default function BlendPage({ setAppLanguage }) {
  const matchingWords = () => {
    const textToSearch = '"H2032""G523""5NH 6""ADV 2:25"hguuvg"1SA 5:1"';
    if (XRegExp.match(textToSearch, regex, "all").length > 0) {
      console.log(XRegExp.match(textToSearch, regex,'all'));
    }else{
      console.log('No Matchs !')
    }
  };
  matchingWords();


  const appLang = useContext(AppLangContext);
  return (
    <Container fixed className="homepage">
      <Header setAppLanguage={setAppLanguage} selected="mix" />
      <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
        <Typography
          variant="h4"
          paragraph="true"
          sx={{ mt: "20px" }}
          style={{ fontFamily: FontFamily(appLang) }}
        >
          {i18n(appLang, "BLEND_PAGE")}
        </Typography>
        <Footer />
      </Box>
    </Container>
  );
}
