import React, {useContext, useState, useEffect} from "react";
import {
    Typography,
    Grid,
    FormGroup,
    Box,
    OutlinedInput,
    Select,
    MenuItem,
    Button,
} from "@mui/material";
import {Blender} from "@mui/icons-material";
import {SofriaRenderFromProskomma} from "proskomma-json-tools";
import sofria2WebActions from "../renderer/sofria2web";
import DocSelector from "./DocSelector";
import AppLangContext from "../contexts/AppLangContext";
import { directionText, fontFamily } from "../i18n/languageDirection";
import { renderers } from "../renderer/render2react";
import i18n from "../i18n";
import BlendModal from "./BlendModal";

export default function BrowseScripture({pk, docId, setDocId, blendables}) {
    const appLang = useContext(AppLangContext);

    const [openBlendModal, setOpenBlendModal] = useState(false);
    const handleOpenBlendModal = () => setOpenBlendModal(true);
    const handleCloseBlendModal = () => setOpenBlendModal(false);
    const [usedBlendables, setUsedBlendables] = useState({});

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
        updatedAtts: false,
    });

    const allNames = [
        "wordAtts",
        "titles",
        "headings",
        "introductions",
        "footnotes",
        "xrefs",
        "paraStyles",
        "characterMarkup",
        "chapterLabels",
        "versesLabels",
    ];

    const [includedNames, setIncludedNames] = useState(allNames);
    const [includedFlags, setIncludedFlags] = useState({
        showWordAtts: true,
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
    const getStyles = (name) => {
        return {
            fontWeight: includedNames.indexOf(name) === -1 ? "normal" : "bold",
        };
    };

    const handleIncludedChange = (event) => {
        const {
            target: {value},
        } = event;
        setIncludedNames(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value
        );
    };

    const makeIncludedFlags = (allN, includedN) => {
        const ret = {};
        for (const name of allN) {
            ret[`show${name.substring(0, 1).toUpperCase()}${name.substring(1)}`] =
                includedN.includes(name);
        }
        return ret;
    };

    useEffect(() => {
        const flags = makeIncludedFlags(allNames, includedNames);
        setIncludedFlags({
            ...includedFlags,
            showWordAtts: flags.showWordAtts,
            showTitles: flags.showTitles,
            showHeadings: flags.showHeadings,
            showIntroductions: flags.showIntroductions,
            showFootnotes: flags.showFootnotes,
            showXrefs: flags.showXrefs,
            showParaStyles: flags.showParaStyles,
            showCharacterMarkup: flags.showCharacterMarkup,
            showChapterLabels: flags.showChapterLabels,
            showVersesLabels: flags.showVersesLabels,
        });
    }, [includedNames]);

    useEffect(() => {
        setScriptureData({
            ...scriptureData,
            showWordAtts: includedFlags.showWordAtts,
            showTitles: includedFlags.showTitles,
            showHeadings: includedFlags.showHeadings,
            showIntroductions: includedFlags.showIntroductions,
            showFootnotes: includedFlags.showFootnotes,
            showXrefs: includedFlags.showXrefs,
            showParaStyles: includedFlags.showParaStyles,
            showCharacterMarkup: includedFlags.showCharacterMarkup,
            showChapterLabels: includedFlags.showChapterLabels,
            showVersesLabels: includedFlags.showVersesLabels,
            updatedAtts: true,
        });
    }, [includedFlags]);

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
        if ((newDocId !== scriptureData.renderedDocId) || scriptureData.updatedAtts) {
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
                showWordAtts: includedFlags.showWordAtts,
                showTitles: includedFlags.showTitles,
                showHeadings: includedFlags.showHeadings,
                showIntroductions: includedFlags.showIntroductions,
                showFootnotes: includedFlags.showFootnotes,
                showXrefs: includedFlags.showXrefs,
                showParaStyles: includedFlags.showParaStyles,
                showCharacterMarkup: includedFlags.showCharacterMarkup,
                showChapterLabels: includedFlags.showChapterLabels,
                showVersesLabels: includedFlags.showVersesLabels,
                updatedAtts: false,
            });
            if (docId !== newDocId) {
                setDocId(newDocId);
            }
        }
    }, [scriptureData, docId, includedNames]);
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
            style={{fontFamily: fontFamily(appLang)}}
        >
            <Grid item xs={12}>
                <Box sx={{marginRight: "5px"}}>
                    <FormGroup>
                        <Select
                            labelId="included-content-group-label"
                            id="included-content"
                            multiple
                            value={includedNames}
                            onChange={handleIncludedChange}
                            input={<OutlinedInput label="Name"/>}
                            sx={{width: 450}}
                        >
                            {allNames.map((name) => (
                                <MenuItem key={name} value={name} style={getStyles(name)}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormGroup>
                </Box>
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
                <Box display="flex" justifyContent="flex-end">
                    <Button onClick={handleOpenBlendModal}>
                        <Blender color="primary" sx={{fontSize: 30}}/>
                    </Button>
                </Box>
            </Grid>
            <BlendModal
                openBlendModal={openBlendModal}
                handleCloseBlendModal={handleCloseBlendModal}
                blendables={blendables}
                usedBlendables={usedBlendables}
                setUsedBlendables={setUsedBlendables}
            />
            <Grid item xs={12}>
                {scriptureData.rendered && docId === scriptureData.renderedDocId ? (
                    <>{scriptureData.rendered}</>
                ) : (
                    <Typography>{i18n(appLang, "LOADING")}...</Typography>
                )}
            </Grid>
        </Grid>
    );
}
