import {
  Box,
  Button,
  Fade,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { SofriaRenderFromProskomma } from "proskomma-json-tools";
import { useContext, useEffect, useState } from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {
  directionText,
  setFontFamily,
  alignmentText,
} from "../i18n/languageDirection";
import sofria2WebActions from "../renderer/sofria2web";
import PrintIcon from "@mui/icons-material/Print";

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

export default function PrintModal({
  openPrintModal,
  handleClosePrintModal,
  pk,
}) {
  const appLang = useContext(AppLangContext);

  const [scriptureData, setScriptureData] = useState({
    docId: null,
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
    updatedAtts: false,
  });
  const [pageFormat, setPageFormat] = useState({
    width: null,
    height: null,
  });

  const chooseFormat = (e) => {
    if (e === "A4") {
      setPageFormat({
        ...pageFormat,
        width: 210,
        height: 297,
      });
    }
    if (e === "A5") {
      setPageFormat({
        ...pageFormat,
        width: 148,
        height: 210,
      });
    }
    if (e === "us letter") {
      setPageFormat({
        ...pageFormat,
        width: 215.9,
        height: 279.4,
      });
    }
  };

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
    if (!scriptureData.docId) {
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
      newDocId = scriptureData.docId;
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
        docId: newDocId,
        renderedDocId: newDocId,
        menuQuery,
        rendered: output.paras,
        updatedAtts: false,
      });
    }
  }, [scriptureData]);

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

  const setDocId = (newId) =>
    setScriptureData({ ...scriptureData, docId: newId });
  const toggleWordAtts = () =>
    setScriptureData({
      ...scriptureData,
      showWordAtts: !scriptureData.showWordAtts,
      updatedAtts: true,
    });
  const toggleTitles = () =>
    setScriptureData({
      ...scriptureData,
      showTitles: !scriptureData.showTitles,
      updatedAtts: true,
    });
  const toggleHeadings = () =>
    setScriptureData({
      ...scriptureData,
      showHeadings: !scriptureData.showHeadings,
      updatedAtts: true,
    });
  const toggleIntroductions = () =>
    setScriptureData({
      ...scriptureData,
      showIntroductions: !scriptureData.showIntroductions,
      updatedAtts: true,
    });
  const toggleFootnotes = () =>
    setScriptureData({
      ...scriptureData,
      showFootnotes: !scriptureData.showFootnotes,
      updatedAtts: true,
    });
  const toggleXrefs = () =>
    setScriptureData({
      ...scriptureData,
      showXrefs: !scriptureData.showXrefs,
      updatedAtts: true,
    });
  const toggleParaStyles = () =>
    setScriptureData({
      ...scriptureData,
      showParaStyles: !scriptureData.showParaStyles,
      updatedAtts: true,
    });
  const toggleCharacterMarkup = () =>
    setScriptureData({
      ...scriptureData,
      showCharacterMarkup: !scriptureData.showCharacterMarkup,
      updatedAtts: true,
    });
  const toggleChapterLabels = () =>
    setScriptureData({
      ...scriptureData,
      showChapterLabels: !scriptureData.showChapterLabels,
      updatedAtts: true,
    });
  const toggleVersesLabels = () =>
    setScriptureData({
      ...scriptureData,
      showVersesLabels: !scriptureData.showVersesLabels,
      updatedAtts: true,
    });

  const setFloat = (lang) => {
    if (alignmentText(lang) === "right") {
      return "left";
    }
    if (alignmentText(lang) === "left") {
      return "right";
    }
  };

  const onPrintClick = () => {
    const newPage = window.open();
    newPage.document.head.innerHTML = "<title>PDF Preview</title>";
    newPage.document.body.innerHTML = "<p>Hello World !</p>";
  };
  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openPrintModal}
        onClose={handleClosePrintModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openPrintModal}>
          <Box sx={style}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Print Page
            </Typography>
            <Grid
              container
              dir={directionText(appLang)}
              style={{ fontFamily: setFontFamily(appLang) }}
            >
              <Grid sx={{display:"flex",flexDirection:"row"}}>
                <FormGroup
                  sx={{
                    margin: "10%",
                    float:'left',
                    display:'flex',
                    flexDirection:'column'
                  }}
                >
                  <Box style={{ fontFamily: setFontFamily(appLang) }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showTitles}
                          color="secondary"
                          size="small"
                          onChange={() => toggleTitles()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabledIntroductions={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_TITLES")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showHeadings}
                          color="secondary"
                          size="small"
                          onChange={() => toggleHeadings()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_HEADINGS")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showIntroductions}
                          color="secondary"
                          size="small"
                          onChange={() => toggleIntroductions()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_INTRODUCTIONS")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showFootnotes}
                          color="secondary"
                          size="small"
                          onChange={() => toggleFootnotes()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_FOOTNOTES")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showXrefs}
                          color="secondary"
                          size="small"
                          onChange={() => toggleXrefs()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_XREFS")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showParaStyles}
                          color="secondary"
                          size="small"
                          onChange={() => toggleParaStyles()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_PARA_STYLES")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showCharacterMarkup}
                          color="secondary"
                          size="small"
                          onChange={() => toggleCharacterMarkup()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_CHAR_STYLES")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showChapterLabels}
                          color="secondary"
                          size="small"
                          onChange={() => toggleChapterLabels()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_CHAPTER_NUMBERS")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showVersesLabels}
                          color="secondary"
                          size="small"
                          onChange={() => toggleVersesLabels()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_VERSE_NUMBERS")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scriptureData.showWordAtts}
                          color="secondary"
                          size="small"
                          onChange={() => toggleWordAtts()}
                          inputProps={{ "aria-label": "controlled" }}
                          disabled={
                            !scriptureData.rendered ||
                            scriptureData.docId !==
                              scriptureData.renderedDocId ||
                            scriptureData.updatedAtts
                          }
                        />
                      }
                      label={i18n(appLang, "BROWSE_PAGE_WORD_INFO")}
                    />
                  </Box>
                </FormGroup>
                <FormGroup
                  sx={{
                    margin: "10%",
                  }}
                >
                  <Box>
                    <FormLabel
                      id="text-direction-group-label"
                      style={{ fontFamily: setFontFamily(appLang) }}
                    >
                      Select a Format :
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby="text-direction-group-label"
                      name="text-direction-buttons-group"
                      onChange={(e) => chooseFormat(e.target.value)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <FormControlLabel
                        value="A4"
                        control={<Radio />}
                        label="Format A4"
                        style={{ fontFamily: setFontFamily(appLang) }}
                      />
                      <FormControlLabel
                        value="A5"
                        control={<Radio />}
                        label="Format A5"
                        style={{ fontFamily: setFontFamily(appLang) }}
                      />
                      <FormControlLabel
                        value="us letter"
                        control={<Radio />}
                        label="Format US letter"
                        style={{ fontFamily: setFontFamily(appLang) }}
                      />
                    </RadioGroup>
                  </Box>
                </FormGroup>
              </Grid>
            </Grid>
            <Button onClick={onPrintClick} sx={{ float: setFloat(appLang) }}>
              <PrintIcon color="primary" sx={{ fontSize: 50 }} />
            </Button>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
