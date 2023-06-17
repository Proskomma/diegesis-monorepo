import React, { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Container, Tabs, Tab, IconButton, Box, TextField, Grid, Typography, Divider, Paper } from '@mui/material';
import { Close, AddCardTwoTone } from '@mui/icons-material';
import { DiegesisUI } from '@eten-lab/ui-kit';
const { MarkdownEditor } = DiegesisUI.FlexibleDesign;

//#region 
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

const CustomTabs = ({ tabs, addTab, deleteTab }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChangeTab = (_, index) => {
        setActiveTab(index);
    };

    const handleCloseTab = (event, index) => {
        event.stopPropagation()
        deleteTab(index)
        setActiveTab((prev) => {
            return (prev === index ? prev - 1 : prev)
        });
    };

    return (
        <Tabs value={activeTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto" sx={{
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
                            ? <TabTitle {...tab} index={index} handleCloseTab={handleCloseTab} />
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
    const { appLang, mutateState: mutateAppState, clientStructure } = useAppContext();

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
            setLanguages(clientStructure.languages.map(l => ({ title: l })))
        }
    }, [clientStructure]);

    const deletePage = (idx) => {
        const clonedPages = [...pages]
        clonedPages.splice(idx, 1)
        setPages(clonedPages)
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

    return (
        <Container>
            <Paper elevation={1}>
                {/* pages */}
                <CustomTabs tabs={pages} addTab={addPage} deleteTab={deletePage} />
                <Divider></Divider>
            </Paper>
            <br />
            <Paper elevation={1}>
                {/* languages */}
                <CustomTabs tabs={languages} deleteTab={deletePage} />
                <Divider></Divider>
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
                        defaultValue="/home"
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
                        defaultValue="Home"
                    />
                </Grid>

                {/* body */}
                <Grid item xs={2}>
                    <Typography>
                        Body
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                    <MarkdownEditor key={'body-markdown'} onChange={(value) => { }} />
                    {/* <CssEditor onChange={(value) => { }} /> */}
                </Grid>
            </Grid>
        </Container>
    )
}


