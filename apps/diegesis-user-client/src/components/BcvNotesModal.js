import {useState, useEffect, useContext} from "react";
import {
    Box,
    Fade,
    Modal,
    Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import ReactMarkdown from 'react-markdown';
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";

const bcvNotesModalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
    maxHeight: "95%",
};

export default function BcvNotesModal({
                                          pk,
                                          bcvNoteRef,
                                          openModal,
                                          handleCloseBcvNotesModal,
                                          usedBlendables
                                      }) {
    const appLang = useContext(AppLangContext);
    const [notesMarkdown, setNotesMarkdown] = useState("");

    useEffect(
        () => {
            if (!bcvNoteRef) {
                return;
            }
            const tableDocSetQueryString = `{
              docSets(withBook:"T01") {
                id
                tagsKv {
                  key
                  value
                }
                documents {
                  bookCode: header(id:"bookCode")
                  id
                }
              }
            }`;
            const dsResult = pk.gqlQuerySync(tableDocSetQueryString);
            const markdowns = [];
            for (const docSet of dsResult.data.docSets) {
                const bcvQueryString = `{
                  t01Doc: document(id:"%t01DocId%") {
                    tableSequences {
                      rows(equals:[{colN:0 values:["""%ref%"""]}] columns:1) {
                        text
                      }
                    }
                  }
                }`
                    .replace('%t01DocId%',docSet.documents.filter(d => d.bookCode === "T01")[0].id)
                    .replace('%ref%', `${bcvNoteRef[0]} ${bcvNoteRef[1]}:${bcvNoteRef[2]}`);
                const bcvResult = pk.gqlQuerySync(bcvQueryString);
                const idRow = bcvResult.data.t01Doc.tableSequences[0].rows.map(r => r[0].text)[0];
                if (!idRow) {
                    continue;
                }
                const idQueryString = `{
              document(id:"%t00DocId%") {
                tableSequences {
                  rows(equals:[{colN:2 values:[%ids%]}] columns:3) {
                    text
                  }
                } 
              }
            }`
                    .replace('%t00DocId%',docSet.documents.filter(d => d.bookCode === "T00")[0].id)
                    .replace('%ids%', `${idRow.split(',').map(v => `"""${v}"""`).join(',')}`);
                const idResult = pk.gqlQuerySync(idQueryString);
                const idRows = idResult.data.document.tableSequences[0].rows;
                if (idRows.length > 0) {
                    markdowns.push("## " + docSet.tagsKv.filter(t => t.key === "title")[0].value);
                }
                idResult.data.document.tableSequences[0].rows.map(r => r[0].text).forEach(t => markdowns.push(t));
            }
            setNotesMarkdown(markdowns.join('\n\n---\n\n'));
        },
        [bcvNoteRef, usedBlendables]
    );

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openModal}
            onClose={handleCloseBcvNotesModal}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={openModal}>
                <Box sx={bcvNotesModalStyle}>
                    <Typography variant="h4" sx={{textAlign: "center"}}>
                        {i18n(appLang, "BCV_NOTES_MODAL_TITLE")}
                        {bcvNoteRef && ` (${bcvNoteRef[0]} ${bcvNoteRef[1]}:${bcvNoteRef[2]})`}
                    </Typography>
                    <ReactMarkdown>{
                        notesMarkdown
                            .replace(/\\n/g, "\n")
                            .replace(/\(See:[^)]+\)/g, "")
                    }</ReactMarkdown>
                </Box>
            </Fade>
        </Modal>
    );
}
