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
            const bcvQueryString = `{
              documents(withBook:"T01") {
                tableSequences {
                  rows(equals:[{colN:0 values:"""%ref%"""}] columns:1) {
                    text
                  }
                } 
              }
            }`.replace('%ref%', `${bcvNoteRef[0]} ${bcvNoteRef[1]}:${bcvNoteRef[2]}`);
            const result = pk.gqlQuerySync(bcvQueryString);
            const idRow = result.data.documents[0].tableSequences[0].rows.map(r => r[0].text)[0];
            if (!idRow) {
                return;
            }
            const idQueryString = `{
              documents(withBook:"T00") {
                tableSequences {
                  rows(equals:[{colN:2 values:[%ids%]}] columns:3) {
                    text
                  }
                } 
              }
            }`.replace('%ids%', `${idRow.split(',').map(v => `"""${v}"""`).join(',')}`);
            const result2 = pk.gqlQuerySync(idQueryString);
            const markdowns = result2.data.documents[0].tableSequences[0].rows.map(r => r[0].text);
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
                    <ReactMarkdown>{notesMarkdown}</ReactMarkdown>
                </Box>
            </Fade>
        </Modal>
    );
}
