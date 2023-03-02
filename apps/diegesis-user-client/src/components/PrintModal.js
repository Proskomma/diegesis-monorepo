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
import {SofriaRenderFromProskomma} from "proskomma-json-tools";
import {useContext, useState} from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {renderers} from '../renderer/render2html';
import {
    directionText,
    setFontFamily,
    alignmentText,
} from "../i18n/languageDirection";
import sofria2WebActions from "../renderer/sofria2web";
import PrintIcon from "@mui/icons-material/Print";

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

    const pageFormats = {
        A4P: {
            label: "A4 Portrait",
            orientation: "portrait",
            width: "210mm",
            height: "297mm"
        },
        A4L: {
            label: "A4 Landscape",
            orientation: "landscape",
            width: "297mm",
            height: "210mm"
        },
        A5P: {
            label: "A5 Portrait",
            orientation: "portrait",
            width: "148.5mm",
            height: "210mm"
        },
        USLP: {
            label: "US Letter Portrait",
            orientation: "portrait",
            width: "8.5in",
            height: "11in"
        },
        USLL: {
            label: "US Letter Landscape",
            orientation: "landscape",
            width: "11in",
            height: "8.5in"
        },
        TRP: {
            label: "Trade Portrait",
            orientation: "portrait",
            width: "6in",
            height: "9in"
        },
        CQP: {
            label: "Crown Quarto Portrait",
            orientation: "portrait",
            width: "189mm",
            height: "246mm"
        }
    }

    const [formatData, setFormatData] = useState({
        pageFormat: "A4P",
        nColumns: 1
    });

    const doRender = () => {
        if (!docId) {
            return;
        }
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
            renderers
        };
        const output = {};
        try {
            renderer.renderDocument({
                docId,
                config,
                output,
            });
        } catch (err) {
            console.log("Renderer", err);
            throw err;
        }
        return output.paras;
    };

    const toggleScriptureToggle = field => {
        const newData = {...scriptureData};
        newData[field] = !scriptureData[field];
        setScriptureData(newData);
    }

    const setFormatValue = (field, value) => {
        const newData = {...formatData};
        newData[field] = value;
        setFormatData(newData);
    }

    const floatDirection = (lang) => alignmentText(lang) === "right" ? "left" : "right";

    const css = `
        @page {
            size: %pageWidth% %pageHeight%;
            margin-top: 20mm;
            margin-left: 20mm;
            margin-bottom: 30mm;

            @footnote {
                float:bottom;
                border-top: black 1px solid;
                padding-top: 2mm;
                font-size: 8pt;
            }

            @bottom-center {
                content: counter(page);
            }

            @top-center {
                content: element(heading);
            }

            @top-right {
                content: none;
            }
        }

        @page :blank {
            @bottom-center {
                content: none;
            }

            @top-center {
                content: none;
            }

            @top-right {
                content: none;
            }

        }

        @page :right {
            margin-left: 30mm;
            margin-right: 20mm;
        }

        @page :left {
            margin-right: 30mm;
            margin-left: 20mm;
        }
        
        #paras {
            columns: %nColumns%
        }
        h1, h2, h3, h4, h5 {
            columns: 1
        }
        `.replace(
        '%pageWidth%',
        pageFormats[formatData.pageFormat].width
    ).replace(
        '%pageHeight%',
        pageFormats[formatData.pageFormat].height
    ).replace(
        '%nColumns%',
        formatData.nColumns
    );


    const onPrintClick = () => {
        const paras = doRender();
        const newPage = window.open();
        newPage.document.body.innerHTML = `<div id="paras">${paras}</div>`;
        const headContent = "<title>Diegesis PDF Preview</title>";
        newPage.document.head.innerHTML = headContent;
        const script = document.createElement('script');
        const url = `${window.location.protocol}//${window.location.host}/static/pagedjs_0_4_0.js`;
        console.log(url);
        script.src = url;
        newPage.document.head.appendChild(script);
        const style = document.createElement('style');
        style.innerHTML = css;
        newPage.document.head.appendChild(style);
    }
    const ScriptureSwitchField =
        ({fieldName, labelKey}) => <FormControlLabel
            control={
                <Switch
                    checked={scriptureData[fieldName]}
                    color="secondary"
                    size="small"
                    onChange={() => toggleScriptureToggle(fieldName)}
                    inputProps={{"aria-label": "controlled"}}
                />
            }
            label={i18n(appLang, labelKey)}
        />

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
                                    <ScriptureSwitchField
                                        fieldName="showTitles"
                                        labelKey="BROWSE_PAGE_TITLES"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showHeadings"
                                        labelKey="BROWSE_PAGE_HEADINGS"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showIntroductions"
                                        labelKey="BROWSE_PAGE_INTRODUCTIONS"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showFootnotes"
                                        labelKey="BROWSE_PAGE_FOOTNOTES"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showXrefs"
                                        labelKey="BROWSE_PAGE_XREFS"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showParaStyles"
                                        labelKey="BROWSE_PAGE_PARA_STYLES"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showCharacterMarkup"
                                        labelKey="BROWSE_PAGE_CHAR_STYLES"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showChapterLabels"
                                        labelKey="BROWSE_PAGE_CHAPTER_NUMBERS"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showVersesLabels"
                                        labelKey="BROWSE_PAGE_VERSE_NUMBERS"
                                    />
                                    <ScriptureSwitchField
                                        fieldName="showWordAtts"
                                        labelKey="BROWSE_PAGE_WORD_INFO"
                                    />
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
                                            Object.entries(pageFormats)
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
