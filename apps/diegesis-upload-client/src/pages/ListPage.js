import React, { useState, useEffect, useMemo, useContext } from "react";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { Container, Box, Typography, Button } from "@mui/material";
import { Tune } from "@mui/icons-material";
import Header from "../components/Header";
import ListView from "../components/ListView";
import ListViewControls from "../components/ListViewControls";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";
import AppLangContext from "../contexts/AppLangContext";
import { directionText } from "../i18n/languageDirection";
import i18n from "../i18n";

export default function ListPage({ setAppLanguage }) {
  const appLang = useContext(AppLangContext);
  const [showSettings, setShowSettings] = useState(false);
  const [searchOrg, setSearchOrg] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchLang, setSearchLang] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("a-z");
  const [orgs, setOrgs] = useState([]);
  const [name, setName] = useState("");
  const [features, setFeatures] = useState({
    introductions: false,
    headings: false,
    footnotes: false,
    xrefs: false,
    strong: false,
    lemma: false,
    gloss: false,
    content: false,
    occurrences: false,
  });

  const client = new ApolloClient({
    uri: "/graphql",
    cache: new InMemoryCache(),
  });

  const memoClient = useMemo(() => client);

  // runs once, when the page is rendered
  useEffect(() => {
    const doOrgs = async () => {
      const result = await memoClient.query({
        query: gql`
          {
            name
            orgs {
              id: name
            }
          }
        `,
      });
      setSearchOrg(result.data.name);
      setOrgs(result.data.orgs.map((o) => o.id));
      setName(result.data.name);
    };
    doOrgs();
  }, []);


  return (
    <Container fixed className="listpage">
      <Header setAppLanguage={setAppLanguage} selected="uploads" />
      <Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
        <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
          {i18n(appLang, "LIST_PAGE_ENTRIES")}
          {" ("}
          {(name.length > 0) && name}
          {(name.length === 0) && "Loading"}
          {")"}
          <Button onClick={() => setShowSettings(!showSettings)}>
            <Tune />
          </Button>
        </Typography>
        {showSettings && (
          <ListViewControls
            searchTerms={{
              orgs,
              searchOrg,
              setSearchOrg,
              searchOwner,
              setSearchOwner,
              searchType,
              setSearchType,
              searchLang,
              setSearchLang,
              searchText,
              setSearchText,
              sortField,
              setSortField,
              sortDirection,
              setSortDirection,
              features,
              setFeatures,
            }}
            searchIcons={[]}
          />
        )}
      </Box>
      <Box dir={directionText(appLang)} style={{ marginTop: "20px" }}>
        {orgs.length > 0 ? (
          <ListView
            searchTerms={{
              org: searchOrg,
              owner: searchOwner,
              resourceType: searchType,
              lang: searchLang,
              text: searchText,
              features: features,
              sortField: sortField,
              sortDirection: sortDirection,
            }}
          />
        ) : (
          <Spinner />
        )}
      </Box>
      <Footer />
    </Container>
  );
}
