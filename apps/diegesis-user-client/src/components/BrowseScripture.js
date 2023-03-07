import React, { useContext, useState, useEffect } from "react";
import {
  Typography,
  Grid,
  FormGroup,
  Box,
  Button,
} from "@mui/material";
import { Tune } from "@mui/icons-material";
import { SofriaRenderFromProskomma } from "proskomma-json-tools";
import sofria2WebActions from "../renderer/sofria2web";
import DocSelector from "./DocSelector";
import AppLangContext from "../contexts/AppLangContext";
import { directionText, FontFamily } from "../i18n/languageDirection";
import { renderers } from "../renderer/render2react";
import ScriptureSwitchField from "./ScriptureSwitchField";

export default function BrowseScripture({ pk, docId, setDocId }) {
  const appLang = useContext(AppLangContext);

  const [scriptureData, setScriptureData] = useState({
    menuQuery: null,
    renderedDocId: null,
    rendered: null,
    showWordAtts: false,
    showTitles: true,
    showHeadings: true,
    showIntroductions: true,
    showFootnotes: true,
    showXrefs: true,
    showParaStyles: true,
    showCharacterMarkup: true,
    showChapterLabels: true,
    showVersesLabels: true,
    updatedAtts:false
  });

  const [showSettings, setShowSettings] = useState(false);

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
    let newDocId;
    let menuQuery = scriptureData.menuQuery;
    if (!docId) {
      menuQuery = pk.gqlQuerySync(
        `{
               docSets {
                 documents(sortedBy:"paratext") {
                   id
                   headers { key value }
                 }
               }
            }`
      );
      newDocId = menuQuery.data.docSets[0].documents[0].id;
    } else {
      newDocId = docId;
    }
    if (newDocId !== scriptureData.renderedDocId || scriptureData.updatedAtts) {
      const renderer = new SofriaRenderFromProskomma({
        proskomma: pk,
        actions: sofria2WebActions,
      });

      const config = {
        showWordAtts: scriptureData.showWordAtts,
        showTitles: scriptureData.showTitles,
        showHeadings: scriptureData.showHeadings,
        showIntroductions: scriptureData.showIntroductions,
        showFootnotes: scriptureData.showFootnotes,
        showXrefs: scriptureData.showXrefs,
        showParaStyles: scriptureData.showParaStyles,
        showCharacterMarkup: scriptureData.showCharacterMarkup,
        showChapterLabels: scriptureData.showChapterLabels,
        showVersesLabels: scriptureData.showVersesLabels,
        renderers,
      };
      const output = {};
      try {
        renderer.renderDocument({
          docId: newDocId,
          config,
          output,
        });
      } catch (err) {
        console.log("Renderer", err);
        throw err;
      }
      setScriptureData({
        ...scriptureData,
        renderedDocId: newDocId,
        menuQuery,
        rendered: output.paras,
        updatedAtts: false,
      });
      if (docId !== newDocId) {
        setDocId(newDocId);
      }
    }
  }, [scriptureData, docId]);
  const docMenuItems =
    scriptureData.menuQuery &&
    scriptureData.menuQuery.data &&
    scriptureData.menuQuery.data.docSets &&
    scriptureData.menuQuery.data.docSets[0].documents
      ? scriptureData.menuQuery.data.docSets[0].documents.map((d) => ({
          id: d.id,
          label: docName(d),
        }))
      : [];
  return (
    <Grid
      container
      dir={directionText(appLang)}
      style={{ fontFamily: FontFamily(appLang) }}
    >
      <Grid item xs={12} sm={4} md={2} lg={2}>
        <Box sx={{ marginRight: "5px" }}>
          <FormGroup
            sx={{
              padding: "10px",
              backgroundColor: showSettings ? "#ccc" : "inherit",
            }}
          >
            <Button onClick={() => setShowSettings(!showSettings)}>
              <Tune />
            </Button>
            {showSettings && (
              <Box style={{ fontFamily: FontFamily(appLang) }}>
                {[
                  ["showTitles", "BROWSE_PAGE_TITLES"],
                  ["showHeadings", "BROWSE_PAGE_HEADINGS"],
                  ["showIntroductions", "BROWSE_PAGE_INTRODUCTIONS"],
                  ["showFootnotes", "BROWSE_PAGE_FOOTNOTES"],
                  ["showXrefs", "BROWSE_PAGE_XREFS"],
                  ["showParaStyles", "BROWSE_PAGE_PARA_STYLES"],
                  ["showCharacterMarkup", "BROWSE_PAGE_CHAR_STYLES"],
                  ["showChapterLabels", "BROWSE_PAGE_CHAPTER_NUMBERS"],
                  ["showVersesLabels", "BROWSE_PAGE_VERSE_NUMBERS"],
                  ["showWordAtts", "BROWSE_PAGE_WORD_INFO"],
                ].map((fSpec, n) => (
                  <ScriptureSwitchField
                    key={n}
                    fieldName={fSpec[0]}
                    labelKey={fSpec[1]}
                    scriptureData={scriptureData}
                    setScriptureData={setScriptureData}
                  />
                ))}
              </Box>
            )}
          </FormGroup>
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} md={7} lg={8}>
        <DocSelector
          docs={docMenuItems}
          docId={docId}
          setDocId={setDocId}
          disabled={
            !scriptureData.rendered ||
            docId !== scriptureData.renderedDocId ||
            scriptureData.updatedAtts
          }
        />
      </Grid>
      <Grid item xs={12}>
        {scriptureData.rendered && docId === scriptureData.renderedDocId ? (
          <>{scriptureData.rendered}</>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Grid>
    </Grid>
  );
}
