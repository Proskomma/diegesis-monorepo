import React, { useEffect, useState } from 'react'
import { gql, useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Container, Tabs, Tab, IconButton, Box, TextField, Grid, Typography, Paper, Button, Snackbar, Alert } from '@mui/material';
import { Close, AddCardTwoTone, Save } from '@mui/icons-material';
import { DiegesisUI } from '@eten-lab/ui-kit';
import langTable from "../i18n/languages.json";
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
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

    const [pages, setPages] = useState([]); //[{title: 'Page 1', deletable: false, url}]
    const [languages, setLanguages] = useState([]);
    const [activeTabIdx, setActiveTabIdx] = useState({ page: 0, lang: 0 });
    const [curPageInfo, setCurPageInfo] = useState({});
    const { mutateState: mutateAppState, clientStructure } = useAppContext();
    const [deleteDialog, setDeleteDialog] = useState({ open: false, deletableItem: undefined });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'info' });

    const gqlClient = useApolloClient();

    useEffect(() => {
        if (Array.isArray(clientStructure.urlData)) {
            const lastItemIdx = clientStructure.urlData.length - 1
            const options = clientStructure.urlData.map(to => ({ title: to.menuText, deletable: true, url: to.url }));
            if (options[0]) options[0].deletable = false; // home page 
            if (options[lastItemIdx]) options[lastItemIdx].deletable = false; // list page
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
        const url = pages[activeTabIdx.page]?.url
        if (!language || !url) {
            setCurPageInfo({ url: '', menuText: '', body: '', lang: language })
            return
        }
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
                    ...clientStructure.page, url, lang: language
                })
            }
        }).catch(err => {
            console.error('unable to fetch page detail::', err)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTabIdx, clientStructure, pages])

    const openDeleteConfirmation = (e, idx) => {
        e.stopPropagation()
        setDeleteDialog({ open: true, deletableItem: { index: idx } });
    }

    const onDeleteConfirmationRes = (res, deletableItem) => {
        if (res === 'ok' && deletableItem) {
            const curPage = pages[deletableItem.index]
            const mutation = `
            mutation RemoveStaticPage($url: String) {
                removeStaticPage(url: $url)
            }`;
            gqlClient.mutate({
                mutation: gql`${mutation}`, variables: {
                    url: curPage.url ?? '',
                }
            }).then((res) => {
                const clonedPages = [...pages]
                clonedPages.splice(deletableItem.index, 1)
                setPages(clonedPages)
                const pageIdx = activeTabIdx.page
                setActiveTabIdx({ ...activeTabIdx, page: (pageIdx === deletableItem.index ? pageIdx - 1 : pageIdx) })
                setSnackbar({ open: true, type: 'success', message: `Successfully deleted '${curPage.menuText}' page!` })
            }).catch((e) => {
                setSnackbar({ open: true, type: 'error', message: `Failed to deleted '${curPage.menuText}' page!` })
            });
        }
        setDeleteDialog({ open: false, deletableItem: null })
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
        const reqPayload = {
            url: curPageInfo.url ?? '',
            menuText: curPageInfo.menuText ?? '',
            body: curPageInfo.body ?? '',
            lang: curPageInfo.lang ?? ''
        }
        const mutation = `
        mutation SaveStaticPage($config: StaticUIConfig) {
            saveStaticPage(config: $config)
          }`;
        gqlClient.mutate({
            mutation: gql`${mutation}`, variables: { config: reqPayload }
        }).then(() => {
            const clonedPages = [...pages];
            Object.assign(clonedPages[activeTabIdx.page], { ...reqPayload, title: reqPayload.menuText });
            setSnackbar({ open: true, type: 'success', message: `Successfully saved '${reqPayload.menuText}' page!` });
            setPages(clonedPages);
        }).catch((e) => {
            setSnackbar({ open: true, type: 'error', message: `Failed to save '${reqPayload.menuText}' page!` })
        });
    }

    const handleSnackbarClose = (e) => {
        setSnackbar({ ...snackbar, open: false, message: '', type: 'info' })
    }

    return (
        <Container>
            {/* pages */}
            <Paper elevation={1}>
                <CustomTabs
                    tabs={pages}
                    activeTab={activeTabIdx.page}
                    addTab={addPage}
                    deleteTab={openDeleteConfirmation}
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
                        onChange={(e) => {
                            if (!['home', 'list'].includes(curPageInfo.url))
                                setCurPageInfo({ ...curPageInfo, url: e.target.value?.trim()?.toLowerCase() })
                        }}
                        disabled={['home', 'list'].includes(curPageInfo.url)}
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
                        onChange={(e) => {
                            setCurPageInfo({ ...curPageInfo, menuText: e.target.value })
                        }}
                    />
                </Grid>

                {/* body */}
                <Grid item xs={2}>
                    <Typography>
                        Body
                    </Typography>
                </Grid>
                <Grid item xs={10} sx={['list'].includes(curPageInfo.url) ? { cursor: 'not-allowed', opacity: '0.8', pointerEvents: 'none' } : {}}>
                    <MarkdownEditor key={'body-markdown'} value={curPageInfo.body} onChange={(value) => {
                        if (!['list'].includes(curPageInfo.url))
                            setCurPageInfo({ ...curPageInfo, body: value })
                    }} />
                </Grid>
            </Grid>
            <Box sx={{ paddingTop: '3rem', paddingBottom: '2rem', textAlign: 'right' }}>
                <Button variant={'contained'} color={'primary'} size={'large'} endIcon={<Save />} onClick={savePage}>Save</Button>
            </Box>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                handleClose={onDeleteConfirmationRes}
                title='Delete Confirmation'
                description={`Are you sure you want to delete this page!`}
                deletableItem={deleteDialog.deletableItem}
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.type} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}


