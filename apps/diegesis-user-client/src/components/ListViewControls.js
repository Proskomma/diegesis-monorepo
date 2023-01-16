import {Grid, TextField, Checkbox, FormGroup, FormControlLabel, Button} from "@mui/material";
import OrgSelector from "./OrgSelector";
import SortSelector from "./SortSelector";

export default function ListViewController({searchTerms}) {
    return <Grid container>
        <Grid item xs={12} sm={12} md={2} sx={{paddingBottom: "15px"}}>
            <OrgSelector
                orgs={searchTerms.orgs}
                searchOrg={searchTerms.searchOrg}
                setSearchOrg={searchTerms.setSearchOrg}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={1}>
            <TextField
                value={searchTerms.searchOwner}
                onChange={e => searchTerms.setSearchOwner(e.target.value)}
                label="Owner"
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
                label="Type"
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
                label="Lang"
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
                label="Title"
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
                ["OT", "OT"],
                ["NT", "NT"],
                ["DC", "DC"],
                ["Intro", "introductions"],
                ["Heading", "headings"],
                ["Footnote", "footnotes"],
                ["Xref", "xrefs"],
                ["Strong", "strong"],
                ["Lemma", "lemma"],
                ["Gloss", "gloss"],
                ["Content", "content"],
                ["Occurrence", "occurrences"],
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
