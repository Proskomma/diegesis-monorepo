import React, { useEffect, useState } from 'react'
import { gql, useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Container, Tabs, Tab, IconButton, Box, TextField, Grid, Typography, Paper, Button } from '@mui/material';
import { Close, AddCardTwoTone, Save } from '@mui/icons-material';
import { DiegesisUI } from '@eten-lab/ui-kit';
import langTable from "../i18n/languages.json";
const { MarkdownEditor } = DiegesisUI.FlexibleDesign;

//#region functional components
const TabTitle = ({ title, deletable, handleCloseTab, index }) => {
    return (
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            {title}
            {
                deletable &&
                <IconButton sx={{ marginLeft: '0.8rem' }} color={'error'} onClick={(event) => handleCloseTab(event, index)}>
                    <Close />
                </IconButton>
            }
        </Box>
    )
}

const CustomTabs = ({ tabs, activeTab, deleteTab, changeTab }) => {
    return (
        <Tabs value={activeTab} onChange={changeTab} variant="scrollable" scrollButtons="auto" sx={{
            '.Mui-selected': {
                backgroundColor: 'aliceblue'
            }
        }}>
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    sx={{ cursor: 'pointer' }}
                    label={
                        typeof tab.title === 'string'
                            ? <TabTitle {...tab} index={index} handleCloseTab={deleteTab} />
                            : tab.title
                    }
                />
            ))}
        </Tabs>
    );
};
//#endregion

export default function StaticUIConfigPage() {

    const [pages, setPages] = useState([]); //[{title: 'Page 1', deletable: false}]
    const [languages, setLanguages] = useState([]);
    const [activeTabIdx, setActiveTabIdx] = useState({ page: 0, lang: 0 });
    const [curPageInfo, setCurPageInfo] = useState({});
    const { mutateState: mutateAppState, clientStructure } = useAppContext();

    const gqlClient = useApolloClient();

    useEffect(() => {
        if (Array.isArray(clientStructure.urlData)) {
            const lastItemIdx = clientStructure.urlData.length - 1
            const options = clientStructure.urlData.map(to => ({ title: to.menuText, deletable: true }));
            if (options[0]) options[0].deletable = false;
            if (options[lastItemIdx]) options[lastItemIdx].deletable = false;
            if (lastItemIdx > -1) {
                options.splice(lastItemIdx, 0, {
                    title: (
                        <IconButton onClick={addPage} size={'small'}>
                            <AddCardTwoTone />
                        </IconButton>
                    ),
                })
            }
            setPages(options)
        }
        if (Array.isArray(clientStructure.languages)) {
            setLanguages(clientStructure.languages.map(lang => ({ title: langTable[lang]?.autonym ?? '' })))
        }
    }, [clientStructure]);

    useEffect(() => {
        const language = (clientStructure.languages ?? [])[activeTabIdx.lang]
        const url = (clientStructure.urlData ?? [])[activeTabIdx.page]?.url
        if (!language || !url) return
        const gqlQuery = gql`
            query ClientStructure($language: String!, $url: String!) {
              clientStructure {
                page(language: $language, url: $url) {
                  body
                  menuText
                }
              }
            }
        `
        gqlClient.query({
            query: gqlQuery, variables: {
                language,
                url
            }
        }).then(res => {
            const { clientStructure } = res.data ?? {};
            if (clientStructure?.page) {
                setCurPageInfo({
                    ...clientStructure.page, url
                })
            }
        }).catch(err => {
            console.error('unable to fetch page detail::', err)
        })
    }, [activeTabIdx, clientStructure, gqlClient])

    const deletePage = (e, idx) => {
        e.stopPropagation()
        const clonedPages = [...pages]
        clonedPages.splice(idx, 1)
        setPages(clonedPages)
        setActiveTabIdx(prev => {
            const prevPageIdx = prev.page
            return { ...prev, page: (prevPageIdx === idx ? prevPageIdx - 1 : prevPageIdx) }
        })
    }

    const addPage = (e) => {
        e.stopPropagation();
        setPages(prev => {
            const clonedPages = [...prev]
            const newPageIdx = clonedPages.length - 2
            clonedPages.splice(newPageIdx < 0 ? 0 : newPageIdx, 0, { title: 'UN-TITLED', deletable: true })
            return clonedPages
        })
    }

    const savePage = (e) => {
        //@todo:: save page info on server side.
    }

    return (
        <Container>
            {/* pages */}
            <Paper elevation={1}>
                <CustomTabs
                    tabs={pages}
                    activeTab={activeTabIdx.page}
                    addTab={addPage}
                    deleteTab={deletePage}
                    changeTab={(_, idx) => {
                        setActiveTabIdx({ ...activeTabIdx, page: idx })
                    }}
                />
            </Paper>
            <br />
            {/* languages */}
            <Paper elevation={1}>
                <CustomTabs
                    tabs={languages}
                    activeTab={activeTabIdx.lang}
                    changeTab={(_, idx) => {
                        setActiveTabIdx({ ...activeTabIdx, lang: idx })
                    }}
                />
            </Paper>

            <Grid sx={{ marginTop: '2rem' }} container spacing={2}>

                {/* url field */}
                <Grid item xs={2}>
                    <Typography>
                        URL
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField
                        required
                        fullWidth
                        value={curPageInfo.url}
                    />
                </Grid>

                {/* menu text */}
                <Grid item xs={2}>
                    <Typography>
                        Menu Text
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField
                        required
                        fullWidth
                        value={curPageInfo.menuText}
                    />
                </Grid>

                {/* body */}
                <Grid item xs={2}>
                    <Typography>
                        Body
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                    <MarkdownEditor key={'body-markdown'} value={curPageInfo.body} onChange={(value) => {
                        setCurPageInfo({ ...curPageInfo, body: value })
                    }} />
                </Grid>
            </Grid>
            <Box sx={{ paddingTop: '3rem', paddingBottom: '2rem', textAlign: 'right' }}>
                <Button variant={'contained'} color={'primary'} size={'large'} endIcon={<Save />} onClick={savePage}>Save</Button>
            </Box>
        </Container>
    )
}


