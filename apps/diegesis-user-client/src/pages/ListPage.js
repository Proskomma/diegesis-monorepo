import React, {useState, useEffect, useMemo} from 'react';
import {
    ApolloClient,
    gql,
    InMemoryCache,
} from "@apollo/client";
import {Container, Box, Grid, TextField, Typography, Checkbox, FormGroup, FormControlLabel, Button} from "@mui/material";
import {Tune} from '@mui/icons-material';
import Header from "../components/Header";
import ListView from "../components/ListView";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";
import OrgSelector from "../components/OrgSelector";
import SortSelector from "../components/SortSelector";

export default function ListPage({}) {
    const [searchOrg, setSearchOrg] = useState('all');
    const [searchOwner, setSearchOwner] = useState('');
    const [searchType, setSearchType] = useState('');
    const [searchLang, setSearchLang] = useState('');
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortDirection, setSortDirection] = useState('a-z');
    const [orgs, setOrgs] = useState([]);
    const [features, setFeatures] = useState({
        introductions: false,
        headings: false,
        footnotes: false,
        xrefs: false,
        strong: false,
        lemma: false,
        gloss: false,
        content: false,
        occurrences: false
    });
    const [showSettings, setShowSettings] = useState(false);

    const client = new ApolloClient(
        {
            uri: '/graphql',
            cache: new InMemoryCache(),
        }
    );

    const memoClient = useMemo(() => client);

    // This piece runs once, when the page is rendered
    useEffect(
        () => {
            const doOrgs = async () => {
                const result = await memoClient.query({query: gql`{ orgs { id: name } }`});
                setOrgs(result.data.orgs.map(o => o.id));
            };
            doOrgs();
        },
        []
    );

    return <Container fixed className="listpage">
        <Header selected="list">
        </Header>
        <Box style={{marginTop: "100px"}}>
            <Typography variant="h4" paragraph="true" sx={{mt: "20px"}}>
                Entries
                <Button onClick={() => setShowSettings(!showSettings)}>
                    <Tune />
                </Button>
            </Typography>
            {
                showSettings &&
                <Grid container>
                    <Grid item xs={12} sm={12} md={2} sx={{paddingBottom: "15px"}}>
                        <OrgSelector
                            orgs={orgs}
                            searchOrg={searchOrg}
                            setSearchOrg={setSearchOrg}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                        <TextField
                            value={searchOwner}
                            onChange={e => setSearchOwner(e.target.value)}
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
                            value={searchType}
                            onChange={e => setSearchType(e.target.value)}
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
                            value={searchLang}
                            onChange={e => setSearchLang(e.target.value)}
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
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
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
                            sortField={sortField}
                            setSortField={setSortField}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={2}>
                        <Button
                            value={searchText}
                            onClick={() => setSortDirection(sortDirection === 'a-z' ? 'z-a' : 'a-z')}
                            size="small"
                            id="searchTitle"
                            variant="outlined"
                            color="secondary"
                            sx={{display: 'flex', marginLeft: "1em"}}
                        >
                            {sortDirection}
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
                                                    checked={features[i[1]]}
                                                    size="small"
                                                    color="primary"
                                                    onChange={
                                                        () => {
                                                            const nf = {...features};
                                                            nf[i[1]] = !nf[i[1]];
                                                            setFeatures(nf);
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
            }
        </Box>
        <Box style={{marginTop: "20px"}}>
            {orgs.length > 0 ?
                <ListView searchTerms={{
                    org: searchOrg,
                    owner: searchOwner,
                    resourceType: searchType,
                    lang: searchLang,
                    text: searchText,
                    features: features,
                    sortField: sortField,
                    sortDirection: sortDirection
                }}/>
                :
                <Spinner/>
            }
        </Box>
        <Footer/>
    </Container>
}
