import { useParams } from "react-router-dom";
import AppLangContext from "../contexts/AppLangContext";
import { useContext, useState } from "react";
import { DiegesisUI } from '@eten-lab/ui-kit';
const { EntryDetailPage: DiegesisEntryDetail } = DiegesisUI;

export default function EntryDetailPage({ setAppLanguage }) {
    const appLang = useContext(AppLangContext);
    const { source, entryId, revision } = useParams();
    const [selectedBook, setSelectedBook] = useState("");


    return (
        <>
            <DiegesisEntryDetail />
        </>
    );
}
