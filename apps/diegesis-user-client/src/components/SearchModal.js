import {
  Box,
  Button,
  Checkbox,
  Fade,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { useContext, useEffect, useState } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import { directionText, setFontFamily } from "../i18n/languageDirection";
import DocSelector from "./DocSelector";

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

export default function SearchModal({openSearchModal,handleCloseSearchModal,pk,}) {
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
  const [searchFinished, setSearchFinished] = useState(false);
  const [matches, setMatches] = useState([]);

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
    setSearchFinished(false);

    if (searchQuery.length === 0) {
      setValidQuery(false);
      setMatches([]);
      return;
    }

    let strongsNums = searchQuery.split(",");

    const re = /^[hHgG]\d{3,4}$/; // Strong's number pattern

    for (let id = 0; id < strongsNums.length; id++) {
      if (!re.test(strongsNums[id])) {
        setValidQuery(false);
        return;
      }
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

    let strongsNums = searchQuery.split(",");
    const strongAtts = "attribute/spanWithAtts/w/strong/0/";

    strongsNums.forEach((num, id) => {
      strongsNums[id] = '"' + strongAtts + num.toUpperCase() + '"';
    });

    const scopes = strongsNums.join(", ");

    const matchAllString = matchAll ? "true" : "false";

    const queryCore = `cvMatching( withScopes:[${scopes}] allScopes:${matchAllString}) {
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

    setSearchFinished(true);
  };

  // This could be some kind of utility function
  const findValueForLabel = (scopeLabels, label) => {
    for (var i = 0; i < scopeLabels.length; i++) {
      if (label.test(scopeLabels[i])) return scopeLabels[i].replace(/\D/g, "");
    }
  };

  const isTokenStrongsInQuery = (token) => {
    const strongsInQuery = searchQuery.toUpperCase().split(",");

    for (let id = 0; id < strongsInQuery.length; id++) {
      if (token.includes(strongsInQuery[id])) {
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
                <Typography style={{ fontFamily: setFontFamily(appLang) }}>
                  {allBooksTitle}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={8} md={4} lg={4}>
                <TextField
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  label={searchQueryTitle}
                  helperText="H1234,H2345,G3456"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2} lg={2}>
                <Checkbox
                  checked={matchAll}
                  value={matchAll}
                  onChange={(e) => setMatchAll(!matchAll)}
                />
                <Typography style={{ fontFamily: setFontFamily(appLang) }}>
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
                <Button variant="contained" onClick={() => runSearch()}>
                  <span style={{ fontFamily: setFontFamily(appLang) }}>
                    {runSearchTitle}
                  </span>
                </Button>
              </Grid>
              <Grid item xs={12}>
                {!validQuery ? (
                  <span style={{ fontFamily: setFontFamily(appLang) }}>
                    {i18n(appLang, "SEARCH_NOT_VALID_QUERY")}
                  </span>
                ) : !searchFinished ? (
                  <span style={{ fontFamily: setFontFamily(appLang) }}>
                    {i18n(appLang, "SEARCH_VALID_QUERY")}
                  </span>
                ) : matches.length === 0 ? (
                  <span style={{ fontFamily: setFontFamily(appLang) }}>
                    {i18n(appLang, "SEARCH_NO_OCCURENCES")}
                  </span>
                ) : (
                  <div>
                    <p>
                      <span
                        style={{ fontFamily: setFontFamily(appLang) }}
                      >
                        {i18n(appLang, "SEARCH_OCCURENCES_FOUND")}
                      </span>{" "}
                      : {matches.length}{" "}
                    </p>
                    <ul>
                      {matches.map((match) => {
                        return (
                          <li>
                            {match.b + " " + match.c + ":" + match.v}
                            <br />
                            {match.t.map((token) => {
                              return token.scopes.length === 1 ? (
                                isTokenStrongsInQuery(token.scopes[0]) ? (
                                  <b>{token.payload}</b>
                                ) : (
                                  token.payload
                                )
                              ) : (
                                token.payload
                              );
                            })}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}