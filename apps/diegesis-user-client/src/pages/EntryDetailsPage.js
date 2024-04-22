import { useParams } from "react-router-dom";
import { useState } from "react";
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import { gql, useQuery } from "@apollo/client";
import Spinner from "../components/Spinner";
import GqlError from "../components/GqlError";
import {
    directionText,
} from "../i18n/languageDirection";
import i18n from "../i18n";
import PageLayout from "../components/PageLayout";
import { useAppContext } from "../contexts/AppContext";
const { EntryDetailUI, FlexibleDesign } = DiegesisUI;
const { BottomBackBtn, InfoGrid } = EntryDetailUI;
const { FlexibleTopControls, FlexibleSectionDivider, FlexibleBookResourceBox, FlexibleBottomActionButtons } = FlexibleDesign.FlexibleEntryDetailUI;
const { Typography, Box, Container, styled } = MuiMaterial;

const cellsConfig = [
    { id: 'key', disablePadding: true, label: '', numeric: false },
    { id: 'value', disablePadding: false, label: '', numeric: false },
    { id: 'emptyColumn1', disablePadding: false, label: '', numeric: false },
]

export default function EntryDetailPage({ }) {
    const { appLang } = useAppContext();
    const { source, entryId, revision } = useParams();
    const [selectedBook, setSelectedBook] = useState('');
    const queryString = `query {
            localEntry(
              source:"""%source%"""
              id: """%entryId%"""
              revision: """%revision%"""
            ) {
              types
              language
              title
              textDirection
              script
              copyright
              abbreviation
              owner
              nOT : stat(field :"nOT")
              nNT : stat(field :"nNT")
              nDC : stat(field :"nDC")
              nChapters : stat(field :"nChapters")
              nVerses : stat(field :"nVerses")
              bookStats(bookCode: "%bookCode%"){
                stat
                field
              }
              bookCodes
            }
          }`
        .replace("%source%", source)
        .replace("%entryId%", entryId)
        .replace("%revision%", revision)
        .replace("%bookCode%", selectedBook);

    const { loading, error, data } = useQuery(
        gql`
      ${queryString}
    `);

    if (loading) return <Spinner />;
    if (error) return <GqlError error={error} />;
    const entryInfo = data.localEntry;
    if (!entryInfo) {
        return (<PageLayout>
            <Container dir={directionText(appLang)} style={{ marginTop: "50px", marginBottom: "50px" }}>
                <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
                    Processing on server - wait a while and hit "refresh"
                </Typography>
            </Container>
        </PageLayout>)
    }

    const finalScript = i18n(appLang, "ADMIN_LANGUAGE_SCRIPT", [
        entryInfo.script,
    ]);
    let bookCodes = [];
    if (entryInfo.bookCodes.length > 0) {
        bookCodes = [...entryInfo.bookCodes];
    }
    let contentTab = [];
    for (const stat of ["OT", "NT", "DC"]) {
        if (entryInfo[`n${stat}`] > 0) {
            contentTab.push(`${entryInfo[`n${stat}`]} ${stat}`);
        }
    }
    const contentString = contentTab.join(", ");

    const onBookResourceSelect = (value) => {
        setSelectedBook(value)
    }
    const mapEntryToTblData = (entry) => {
        const result = [{ key: i18n(appLang, "ADMIN_DETAILS"), value: '' }]
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_ABBREVIATION"), value: entryInfo.abbreviation })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_COPYRIGHT"), value: entryInfo.copyright })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_LANGUAGE"), value: entryInfo.language })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_DATA_SOURCE"), value: source })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_OWNER"), value: entryInfo.owner })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_ENTRY_ID"), value: entryId })
        result.push({ key: i18n(appLang, "ADMIN_DETAILS_REVISION"), value: revision })
        if (entryInfo.types.includes('bible')) {
            result.push({ key: i18n(appLang, "ADMIN_DETAILS_CONTENT"), value: contentString || "?" })
            result.push({ key: i18n(appLang, "ADMIN_DETAILS_CHAPTERS"), value: entryInfo.nChapters })
            result.push({ key: i18n(appLang, "ADMIN_DETAILS_VERSES"), value: entryInfo.nVerses })
        }
        return result
    }
    const getBookResourceControl = () => {
        if (entryInfo?.types?.includes('bible') && bookCodes.length > 0) {
            return ({
                label: selectedBook,
                value: selectedBook,
                options: bookCodes?.map(bc => ({ id: bc, title: bc })),
                onChange: onBookResourceSelect
            })
        }
        return undefined
    }
    const pageProps = {
        tblData: mapEntryToTblData(entryInfo),
        tblCells: cellsConfig,
        topControlProps: {
            title: entryInfo.title,
            actionButtonProps: {
                downloadBtnHref: `/entry/download/${source}/${entryId}/${revision}`,
                viewBtnHref: `/entry/browse/${source}/${entryId}/${revision}`,
            },
            backBtnProps: {
                href: '/list'
            }
        },
        bookResource: {
            label: i18n(appLang, "ADMIN_DETAILS_TITLE"),
            selectControl: getBookResourceControl()
        },
        noPageLayout: true
    }

    const filteredStatsTab = entryInfo.bookStats.filter((bo) => bo.stat > 0);
    return (
        <PageLayout>
            <Box component={'div'} width={'100%'} height={'100%'}>
                <br />
                <Container component={'div'}>
                    <FlexibleTopControls {...pageProps.topControlProps} />
                </Container>
                <StyledDetailSection>
                    <FlexibleSectionDivider />
                    <InfoGrid tblCells={pageProps.tblCells} tblData={pageProps.tblData} />
                    {pageProps.bookResource?.selectControl ? (
                        <FlexibleBookResourceBox {...pageProps.bookResource} />
                    ) : (
                        <></>
                    )}
                    {
                        entryInfo.types.includes('bible') && selectedBook !== "" &&
                        <BookResourceStats appLang={appLang} stats={filteredStatsTab} />
                    }
                    {entryInfo.types.includes('bible') && selectedBook === "" && bookCodes.length > 0 && (
                        <Typography marginTop={'20px'}>
                            {i18n(appLang, "ADMIN_DETAILS_ALERT")}
                        </Typography>
                    )}
                    <FlexibleSectionDivider marginTop={3} marginBottom={3} />
                    <FlexibleBottomActionButtons {...pageProps.topControlProps} />
                    <BottomBackBtn {...pageProps.topControlProps.backBtnProps} />
                </StyledDetailSection>
            </Box>
        </PageLayout>
    )
}

const BookResourceStats = ({ stats = [], appLang }) => {
    const data = [{ key: '', value: '' }];
    data.push(...stats.map((bo) => ({
        key: i18n(appLang, `STATS_${bo.field}`),
        value: bo.stat
    })));
    return (
        <InfoGrid tblCells={cellsConfig} tblData={data} />
    )
}

const StyledDetailSection = styled(Container)(({ theme }) => ({
    marginTop: '3rem',
    [theme.breakpoints.down('sm')]: {
        marginTop: '1.5rem',
    },
}));