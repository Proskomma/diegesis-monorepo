import {Grid, TextField, Checkbox, FormGroup, FormControlLabel, Button} from "@mui/material";
import { useContext } from "react";
import i18n from "../i18n";
import OrgSelector from "./OrgSelector";
import SortSelector from "./SortSelector";
import AppLangContext from "../contexts/AppLangContext";
import { directionText } from "../i18n/languageDirection";

export default function ListViewController({searchTerms}) {
   
    const appLang = useContext(AppLangContext);
    const title = i18n(appLang, "CONTROLS_TITLE");
    const owner = i18n(appLang, "CONTROLS_OWNER");
    const type = i18n(appLang, "CONTROLS_TYPE");
    const lang = i18n(appLang, "CONTROLS_LANGUAGE");
    return <Grid container>
        <Grid item xs={12} sm={12} md={2} sx={{paddingBottom: "15px"}}>
            <OrgSelector
                orgs={searchTerms.orgs}
                searchOrg={searchTerms.searchOrg}
                setSearchOrg={searchTerms.setSearchOrg}
            />
        </Grid>
        <Grid dir={directionText(appLang)} item xs={12} sm={6} md={1}>
            <TextField
                value={searchTerms.searchOwner}
                onChange={e => searchTerms.setSearchOwner(e.target.value)}
                label={owner}
                size="small"
                id="searchOwner"
                variant="filled"
                color="primary"
                sx={{display: 'flex', marginLeft: "1em"}}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <TextField
                value={searchTerms.searchType}
                onChange={e => searchTerms.setSearchType(e.target.value)}
                label={type}
                size="small"
                id="searchType"
                variant="filled"
                color="primary"
                sx={{display: 'flex', marginLeft: "1em"}}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={1}>
            <TextField
                value={searchTerms.searchLang}
                onChange={e => searchTerms.setSearchLang(e.target.value)}
                label={lang}
                size="small"
                id="searchLanguage"
                variant="filled"
                color="primary"
                sx={{display: 'flex', marginLeft: "1em"}}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <TextField
                value={searchTerms.searchText}
                onChange={e => searchTerms.setSearchText(e.target.value)}
                label={title}
                size="small"
                id="searchTitle"
                variant="filled"
                color="primary"
                sx={{display: 'flex', marginLeft: "1em"}}
            />
        </Grid>
        <Grid item xs={6} sm={6} md={2}>
            <SortSelector
                sortField={searchTerms.sortField}
                setSortField={searchTerms.setSortField}
            />
        </Grid>
        <Grid item xs={6} sm={6} md={2}>
            <Button
                value={searchTerms.searchText}
                onClick={() => searchTerms.setSortDirection(searchTerms.sortDirection === 'a-z' ? 'z-a' : 'a-z')}
                size="small"
                id="searchTitle"
                variant="outlined"
                color="secondary"
                sx={{display: 'flex', marginLeft: "1em"}}
            >
                {searchTerms.sortDirection}
            </Button>
        </Grid>
        {
            [
                [i18n(appLang, "CONTROLS_OT"), "OT"],
                [i18n(appLang, "CONTROLS_NT"), "NT"],
                [i18n(appLang, "CONTROLS_DC"), "DC"],
                [i18n(appLang, "STATS_nIntroductions"), "introductions"],
                [i18n(appLang, "STATS_nHeadings"), "headings"],
                [i18n(appLang, "STATS_nFootnotes"), "footnotes"],
                [i18n(appLang, "STATS_nXrefs"), "xrefs"],
                [i18n(appLang, "STATS_nStrong"), "strong"],
                [i18n(appLang, "CONTROLS_LEMME"), "lemma"],
                [i18n(appLang, "CONTROLS_GLOSS"), "gloss"],
                [i18n(appLang, "STATS_nContent"), "content"],
                [i18n(appLang, "STATS_nOccurrences") ,"occurrences"],
            ].map(
                i =>
                    <Grid item xs={6} sm={4} md={1}>
                        <FormGroup>
                            <FormControlLabel
                                labelPlacement="bottom"
                                control={
                                    <Checkbox
                                        checked={searchTerms.features[i[1]]}
                                        size="small"
                                        color="primary"
                                        onChange={
                                            () => {
                                                const nf = {...searchTerms.features};
                                                nf[i[1]] = !nf[i[1]];
                                                searchTerms.setFeatures(nf);
                                            }
                                        }
                                    />
                                }
                                label={i[0]}
                            />
                        </FormGroup>
                    </Grid>
            )
        }
    </Grid>
};
