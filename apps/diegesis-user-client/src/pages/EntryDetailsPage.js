import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DiegesisUI, MuiMaterial } from '@eten-lab/ui-kit';
import { gql, useQuery } from "@apollo/client";
import AppLangContext from "../contexts/AppLangContext";
import Spinner from "../components/Spinner";
import GqlError from "../components/GqlError";
import {
    directionText,
} from "../i18n/languageDirection";
import i18n from "../i18n";
const { EntryDetailPage: DiegesisEntryDetail,
    MOCK_PAGE_HEADER_PROPS,
    MOCK_PAGE_FOOTER_PROPS,
    MOCK_SIDE_NAV_PROPS,
    MOCK_ENTRY_DETAIL_PAGE_PROPS
} = DiegesisUI;
const { Box, Typography } = MuiMaterial;

export default function EntryDetailPage({ setAppLanguage }) {
    const appLang = useContext(AppLangContext);
    const navigate = useNavigate();
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
        return (<Box dir={directionText(appLang)} style={{ marginTop: "100px" }}>
            <Typography variant="h4" paragraph="true" sx={{ mt: "20px" }}>
                Processing on server - wait a while and hit "refresh"
            </Typography>
        </Box>)
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

    const onViewBtnClick = (e) => {
        navigate(`/v2/entry/browse/${source}/${entryId}/${revision}`)
    }
    const onDownloadBtnClick = (e) => { }
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
        if (entryInfo.types.includes('bible') && selectedBook === "" && bookCodes.length > 0) {
            result.push({ key: i18n(appLang, "ADMIN_DETAILS_ALERT"), value: '' })
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
        ...MOCK_ENTRY_DETAIL_PAGE_PROPS,
        headerProps: MOCK_PAGE_HEADER_PROPS,
        footerProps: MOCK_PAGE_FOOTER_PROPS,
        sideNavProps: MOCK_SIDE_NAV_PROPS,
        tblData: mapEntryToTblData(entryInfo),
        topControlProps: {
            title: entryInfo.title,
            actionBtnsProps: {
                viewBtnText: 'View',
                onViewBtnClick: onViewBtnClick,
                downloadBtnText: 'Download',
                onDownloadBtnClick: onDownloadBtnClick
            },
            backBtnProps: {
                href: '/v2/list'
            }
        },
        bookResource: {
            label: i18n(appLang, "ADMIN_DETAILS_TITLE"),
            selectControl: getBookResourceControl()
        }
    }
    return (
        <>
            <DiegesisEntryDetail {...pageProps} />
        </>
    );
}
