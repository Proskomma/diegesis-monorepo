import {
  Box,
  Button,
  Checkbox,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { useContext, useEffect, useState } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText, fontFamily } from "../i18n/languageDirection";
import DocSelector from "./DocSelector";
import xre from "xregexp";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "auto",
  maxHeight: "95%",
};

const regex = xre(
  '"([hHgG][0-9]{3,5})"|"([A-Z0-9]{3}[ ]{1}[0-9]+)"|([\\p{L}\\p{M}]+)'
);
const StrongsRegex = xre('"[HG][0-9]{3,5}"');
const textRegex = xre("[\\p{L}\\p{M}]+");
export default function SearchModal({
  openSearchModal,
  handleCloseSearchModal,
  pk,
}) {
  const appLang = useContext(AppLangContext);

  const searchQueryTitle = i18n(appLang, "CONTROLS_SEARCHQUERY");
  const runSearchTitle = i18n(appLang, "CONTROLS_RUNSEARCH");
  const allBooksTitle = i18n(appLang, "CONTROLS_ALLBOOKS");
  const matchAllTitle = i18n(appLang, "CONTROLS_MATCHALL");

  const [docId, setDocId] = useState("");
  const [docMenuItems, setDocMenuItems] = useState([]);
  const [searchEntireBible, setSearchEntireBible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchAll, setMatchAll] = useState(false);
  const [validQuery, setValidQuery] = useState(false);
  const [matches, setMatches] = useState([]);
  const [searchTerms, setSearchTerms] = useState({
    strongs: [],
    bc: [],
    text: [],
  });
  const [isSearchable, setIsSearchable] = useState(false);
  const [unsearchedQuery, setUnsearchedQuery] = useState(true);
  const docName = (d) => {
    return (
      d.headers.filter((d) => d.key === "toc3")[0]?.value ||
      d.headers.filter((d) => d.key === "h")[0]?.value ||
      d.headers.filter((d) => d.key === "toc2")[0]?.value ||
      d.headers.filter((d) => d.key === "toc")[0]?.value ||
      d.headers.filter((d) => d.key === "bookCode")[0].value
    );
  };

  useEffect(() => {
    const textMatches = xre.match(searchQuery, regex, "all");
    const resultTable = [null, "strongs", "bc", "text"];
    const terms = {
      strongs: [],
      bc: [],
      text: [],
    };
    for (const match of textMatches) {
      const capturedMatch = xre.exec(match, regex);
      for (let i = 1; i < resultTable.length; i++) {
        if (capturedMatch[i]) {
          terms[resultTable[i]].push(capturedMatch[i]);
          continue;
        }
      }
    }
    setSearchTerms(terms);
  }, [searchQuery]);

  useEffect(() => {
    let ret;
    for (const term of Object.keys(searchTerms)) {
      if (searchTerms[term].length > 0) {
        ret = true;
      }
      setIsSearchable(ret);
    }
  }, [searchTerms]);

  useEffect(() => {
    const docSetInfo = pk.gqlQuerySync(
      `{
                docSets {
                  documents(sortedBy:"paratext") {
                    id
                    headers { key value }
                  }
                }
              }`
    );

    setDocId(docSetInfo.data.docSets[0].documents[0].id);
    setDocMenuItems(
      docSetInfo.data.docSets[0].documents.map((d) => ({
        id: d.id,
        label: docName(d),
      }))
    );
  }, []); // this function (likely) only needs to run on initialization. Is this a good way of making such a function?

  useEffect(() => {
    if (searchQuery.length === 0) {
      setValidQuery(false);
      setMatches([]);
      return;
    }

    if (!docId || docId === "pleaseChoose") {
      setMatches([]);
      return;
    }

    setValidQuery(true);
  }, [searchEntireBible, searchQuery, docId, matchAll]);

  const runSearch = () => {
    setMatches([]);

    if (!validQuery) {
      return;
    }

    let strongsNums = searchTerms["strongs"];
    const strongAtts = "attribute/spanWithAtts/w/strong/0/";

    strongsNums.forEach((num, id) => {
      strongsNums[id] = '"' + strongAtts + num.toUpperCase() + '"';
    });
    const scopes = strongsNums.join(", ");

    let textStrings = searchTerms["text"];
    textStrings.forEach((str, id) => {
      textStrings[id] = '"' + str + '"';
    });
    const textScopes = textStrings.join(", ");

    const matchAllString = matchAll ? "true" : "false";

    let params = "";
    if (textStrings.length > 0) {
      params = `withChars:[${textScopes}] allChars:${matchAllString}`;
    }
    if (strongsNums.length > 0) {
      params += ` withScopes:[${scopes}] allScopes:${matchAllString}`;
    }

    const queryCore = `cvMatching(${params}) {
              scopeLabels
              tokens {
                payload
                scopes( startsWith: "${strongAtts}")
              }
            }`;
    const bibleQuery = `{
              documents(sortedBy:"paratext") {
                id
                ${queryCore}
              }
            }`;

    const singleBookQuery = `{
              document(id: "${docId}" ) {
                id
                ${queryCore}
              }
            }`;

    const result = pk.gqlQuerySync(
      searchEntireBible ? bibleQuery : singleBookQuery
    );
    if (searchEntireBible) {
      let matches = [];
      result.data.documents.forEach((doc) => {
        doc.cvMatching.map((match) =>
          matches.push({
            b: docMenuItems.find((d) => d.id === doc.id).label,
            c: findValueForLabel(match.scopeLabels, /chapter/),
            v: findValueForLabel(match.scopeLabels, /verse/),
            t: match.tokens,
          })
        );
      });
      setMatches(matches);
    } else {
      setMatches(
        result.data.document.cvMatching.map((match) => ({
          b: docMenuItems.find((d) => d.id === docId).label,
          c: findValueForLabel(match.scopeLabels, /chapter/),
          v: findValueForLabel(match.scopeLabels, /verse/),
          t: match.tokens,
        }))
      );
    }

    setUnsearchedQuery(false);
  };
  // This could be some kind of utility function
  const findValueForLabel = (scopeLabels, label) => {
    for (var i = 0; i < scopeLabels.length; i++) {
      if (label.test(scopeLabels[i])) return scopeLabels[i].replace(/\D/g, "");
    }
  };

  const isTokenStrongsInQuery = (token) => {
    const strongsMatchingInQuery = xre.match(searchQuery, StrongsRegex, "all");
    const strongsInQuery = [];
    for (const strong of strongsMatchingInQuery) {
      strongsInQuery.push(strong.replace(/\"/g, ""));
    }
    for (let id = 0; id < strongsInQuery.length; id++) {
      if (token.includes(strongsInQuery[id])) {
        return true;
      }
    }
  };

  const isTokenTextsInQuery = (token) => {
    const textMatchingInQuery = xre.match(searchQuery, textRegex, "all");
    const textInQuery = [];
    for (const txt of textMatchingInQuery) {
      textInQuery.push(txt);
    }
    for (let id = 0; id < textInQuery.length; id++) {
      if (token.includes(textInQuery[id])) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openSearchModal}
        onClose={handleCloseSearchModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openSearchModal}>
          <Box sx={style} dir={directionText(appLang)}>
            <Typography
              variant="h4"
              sx={{ textAlign: "center", marginBottom: "2%" }}
            >
              {i18n(appLang, "SEARCH")}
            </Typography>
            <Grid container>
              <Grid item xs={6} sm={8} md={2} lg={2}>
                <DocSelector
                  docs={docMenuItems}
                  docId={docId}
                  setDocId={setDocId}
                  disabled={searchEntireBible}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2} lg={2}>
                <Checkbox
                  checked={searchEntireBible}
                  value={searchEntireBible}
                  onChange={(e) => setSearchEntireBible(!searchEntireBible)}
                />
                <Typography style={{ fontFamily: fontFamily(appLang) }}>
                  {allBooksTitle}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={8} md={4} lg={4}>
                <TextField
                  value={searchQuery}
                  onChange={(e) => {
                    setUnsearchedQuery(true);
                    setSearchQuery(e.target.value);
                  }}
                  label={searchQueryTitle}
                  helperText='Strongs:"H1234" or BC:"1CH 12" or Text'
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2} lg={2}>
                <Checkbox
                  checked={matchAll}
                  value={matchAll}
                  onChange={(e) => setMatchAll(!matchAll)}
                />
                <Typography style={{ fontFamily: fontFamily(appLang) }}>
                  {matchAllTitle}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={2}
                md={2}
                lg={2}
                sx={{ justifySelf: "flex-end" }}
              >
                <Button
                  variant="contained"
                  onClick={() => runSearch()}
                  disabled={!isSearchable}
                >
                  <span style={{ fontFamily: fontFamily(appLang) }}>
                    {runSearchTitle}
                  </span>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", fontFamily: fontFamily(appLang) }}
                >
                  {i18n(appLang, "SEARCH_TERMS")}
                </Typography>
                {searchTerms.strongs.length === 0 &&
                searchTerms.bc.length === 0 &&
                searchTerms.text.length === 0 ? (
                  <Typography>{i18n(appLang, "NO_VALID_TERMS")}</Typography>
                ) : (
                  <List>
                    {searchTerms.strongs.length === 0 ? (
                      ""
                    ) : (
                      <ListItem>
                        <ListItemText
                          sx={{ fontFamily: fontFamily(appLang) }}
                          dir={directionText(appLang)}
                          primary={`${i18n(appLang, "STRONGS")} : ${xre.match(
                            searchQuery,
                            StrongsRegex,
                            "all"
                          )}`}
                        />
                      </ListItem>
                    )}
                    {searchTerms.bc.length === 0 ? (
                      ""
                    ) : (
                      <ListItem dir={directionText(appLang)}>
                        <ListItemText
                          sx={{ fontFamily: fontFamily(appLang) }}
                          primary={`${i18n(appLang, "BC")} : ${searchTerms.bc}`}
                        />
                      </ListItem>
                    )}
                    {searchTerms.text.length === 0 ? (
                      ""
                    ) : (
                      <ListItem dir={directionText(appLang)}>
                        <ListItemText
                          sx={{ fontFamily: fontFamily(appLang) }}
                          primary={`${i18n(appLang, "TEXT")} : ${
                            searchTerms.text
                          }`}
                        />
                      </ListItem>
                    )}
                  </List>
                )}
                {!unsearchedQuery && (
                  <>
                    <Typography
                      variant="h6"
                      style={{
                        fontWeight: "bold",
                        fontFamily: fontFamily(appLang),
                      }}
                    >
                      {i18n(appLang, "SEARCH_OCCURENCES_FOUND")} :
                      {matches.length}{" "}
                    </Typography>
                    <List>
                      {matches.map((match) => {
                        return (
                          <ListItem>
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                              dir={directionText(appLang)}
                            >
                              <ListItemButton
                                onClick={(e) => console.log(e)}
                                sx={{
                                  color: "#007",
                                  textDecoration: "underline",
                                }}
                              >
                                <ListItemText>
                                  {match.b + " " + match.c + ":" + match.v}
                                </ListItemText>
                              </ListItemButton>
                              <ListItemText>
                                {match.t.map((token) => {
                                  return token.scopes.length === 1 ? (
                                    isTokenTextsInQuery(token.payload) ||
                                    isTokenStrongsInQuery(token.scopes[0]) ? (
                                      <b>{token.payload}</b>
                                    ) : (
                                      token.payload
                                    )
                                  ) : (
                                    token.payload
                                  );
                                })}
                              </ListItemText>
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
