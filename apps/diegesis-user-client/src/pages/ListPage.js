import React, {useState, useEffect, useMemo, useContext} from 'react';
import {
    ApolloClient,
    gql,
    InMemoryCache,
} from "@apollo/client";
import { MuiMaterial } from '@eten-lab/ui-kit';
import {Tune} from "@mui/icons-material";
import ListView from "../components/ListView";
import ListViewControls from "../components/ListViewControls";
import Spinner from "../components/Spinner";
import AppLangContext from "../contexts/AppLangContext";
import { directionText, fontFamily } from "../i18n/languageDirection";
import i18n from '../i18n';
import PageLayout from '../components/PageLayout';
const { Container, Typography, Button } = MuiMaterial;


export default function ListPage({ setAppLanguage }) {

    const appLang = useContext(AppLangContext);
    const [showSettings, setShowSettings] = useState(false);
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

    const client = new ApolloClient(
        {
            uri: '/graphql',
            cache: new InMemoryCache(),
        }
    );

    const memoClient = useMemo(() => client);

    // runs once, when the page is rendered
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

    const entries = i18n(appLang, "LIST_PAGE_ENTRIES");

    return <PageLayout>
        <Container dir={directionText(appLang)} style={{marginTop: "50px"}}>
            <Typography  variant="h4" paragraph="true" sx={{mt: "20px"}} style={{ fontFamily : fontFamily(appLang)}}>
                {entries}
                <Button onClick={() => setShowSettings(!showSettings)}>
                    <Tune/>
                </Button>
            </Typography>
            {
                showSettings &&
                <ListViewControls searchTerms ={{
                    orgs,
                    searchOrg,
                    setSearchOrg,
                    searchOwner,
                    setSearchOwner,
                    searchType,
                    setSearchType,
                    searchLang,
                    setSearchLang,
                    searchText,
                    setSearchText,
                    sortField,
                    setSortField,
                    sortDirection,
                    setSortDirection,
                    features,
                    setFeatures
                }}/>
            }
        </Container>
        <Container dir={directionText(appLang)} style={{marginTop: "20px", marginBottom: '50px'}}>
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
        </Container>
    </PageLayout>
}
