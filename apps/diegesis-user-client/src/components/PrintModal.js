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
    Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import PrintIcon from "@mui/icons-material/Print";
import {useContext, useState} from "react";
import AppLangContext from "../contexts/AppLangContext";
import ScriptureSwitchField from "./ScriptureSwitchField";
import {
    directionText,
    setFontFamily,
    alignmentText,
} from "../i18n/languageDirection";
import printModalResources from "../lib/printModalResources";

const printModalStyle = {
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

export default function PrintModal(
    {
        openPrintModal,
        handleClosePrintModal,
        pk,
        docId
    }
) {
    const appLang = useContext(AppLangContext);

    const [scriptureData, setScriptureData] = useState({
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
    });

    const [formatData, setFormatData] = useState({
        pageFormat: "A4P",
        nColumns: 1
    });

    const setFormatValue = (field, value) => {
        const newData = {...formatData};
        newData[field] = value;
        setFormatData(newData);
    }

    const floatDirection = (lang) => alignmentText(lang) === "right" ? "left" : "right";

    const substituteCss = (template, replaces) => {
        let ret = template;
        for (const [placeholder, replacement] of replaces) {
            ret = ret.replace(placeholder, replacement);
        }
        return ret;
    }

    const pageCss = substituteCss(
        printModalResources.pageCssTemplate,
        [
            ['%pageWidth%', printModalResources.pageSizes[formatData.pageFormat].width],
            ['%pageHeight%', printModalResources.pageSizes[formatData.pageFormat].height],
            ['%nColumns%', formatData.nColumns]
        ]
    )

     const onPrintClick = () => {
        const paras = printModalResources.doRender({pk, scriptureData, docId});
        const newPage = window.open();
        newPage.document.body.innerHTML = `<div id="paras">${paras}</div>`;
        newPage.document.head.innerHTML = "<title>Diegesis PDF Preview</title>";
        const script = document.createElement('script');
        script.src = `${window.location.protocol}//${window.location.host}/static/pagedjs_0_4_0.js`;
        newPage.document.head.appendChild(script);
        const style = document.createElement('style');
        style.innerHTML = pageCss;
        newPage.document.head.appendChild(style);
    }

    return (
        <>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openPrintModal}
                onClose={handleClosePrintModal}
                closeAfterTransition
                slots={{backdrop: Backdrop}}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={openPrintModal}>
                    <Box sx={printModalStyle}>
                        <Typography variant="h4" sx={{textAlign: "center"}}>
                            Print Page
                        </Typography>
                        <Grid
                            container
                            dir={directionText(appLang)}
                            style={{fontFamily: setFontFamily(appLang)}}
                        >
                            <Grid item>
                                <FormGroup>
                                    <FormLabel
                                        id="included-content-group-label"
                                        style={{fontFamily: setFontFamily(appLang)}}
                                    >
                                        Included Content
                                    </FormLabel>
                                    {
                                        [
                                            ["showTitles", "BROWSE_PAGE_TITLES"],
                                            ["showHeadings", "BROWSE_PAGE_HEADINGS"],
                                            ["showIntroductions", "BROWSE_PAGE_INTRODUCTIONS"],
                                            ["showFootnotes", "BROWSE_PAGE_FOOTNOTES"],
                                            ["showXrefs", "BROWSE_PAGE_XREFS"],
                                            ["showParaStyles", "BROWSE_PAGE_PARA_STYLES"],
                                            ["showCharacterMarkup", "BROWSE_PAGE_CHAR_STYLES"],
                                            ["showChapterLabels", "BROWSE_PAGE_CHAPTER_NUMBERS"],
                                            ["showVersesLabels", "BROWSE_PAGE_VERSE_NUMBERS"],
                                            ["showWordAtts", "BROWSE_PAGE_WORD_INFO"]
                                        ].map(
                                            (fSpec, n) => <ScriptureSwitchField
                                                key={n}
                                                fieldName={fSpec[0]}
                                                labelKey={fSpec[1]}
                                                scriptureData={scriptureData}
                                                setScriptureData={setScriptureData}
                                            />
                                        )
                                    }
                                </FormGroup>
                            </Grid>
                            <Grid item>
                                <FormGroup>
                                    <FormLabel
                                        id="page-size-group-label"
                                        style={{fontFamily: setFontFamily(appLang)}}
                                    >
                                        Page Size
                                    </FormLabel>
                                    <RadioGroup
                                        aria-labelledby="page-size-group-label"
                                        name="page-size-buttons-group"
                                        defaultValue="A4P"
                                        onChange={(e) => setFormatValue('pageFormat', e.target.value)}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {
                                            Object.entries(printModalResources.pageSizes)
                                                .map((pf, n) => <FormControlLabel
                                                    key={n}
                                                    value={pf[0]}
                                                    control={<Radio/>}
                                                    label={pf[1].label}
                                                    style={{fontFamily: setFontFamily(appLang)}}
                                                />)
                                        }
                                    </RadioGroup>
                                </FormGroup>
                            </Grid>
                            <Grid item>
                                <FormGroup>
                                    <FormLabel
                                        id="page-columns-group-label"
                                        style={{fontFamily: setFontFamily(appLang)}}
                                    >
                                        Columns
                                    </FormLabel>
                                    <RadioGroup
                                        aria-labelledby="page-columns-group-label"
                                        name="page-columns-buttons-group"
                                        defaultValue="1"
                                        onChange={(e) => setFormatValue('nColumns', e.target.value)}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {
                                            [1, 2, 3]
                                                .map((nc, n) => <FormControlLabel
                                                    key={n}
                                                    value={nc}
                                                    control={<Radio/>}
                                                    label={`${nc}`}
                                                    style={{fontFamily: setFontFamily(appLang)}}
                                                />)
                                        }
                                    </RadioGroup>
                                </FormGroup>
                            </Grid>
                        </Grid>
                        <Button onClick={onPrintClick} sx={{float: floatDirection(appLang)}}>
                            <PrintIcon color="primary" sx={{fontSize: 50}}/>
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
