import React from "react";
import {
    Box,
    Grid,
    Fade,
    Modal,
    Typography,
    Checkbox
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import {useContext} from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";

const blendModalStyle = {
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

export default function BlendModal({
                                       openBlendModal,
                                       handleCloseBlendModal,
                                       blendables,
                                       usedBlendables,
                                       setUsedBlendables
                                   }) {
    const appLang = useContext(AppLangContext);

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openBlendModal}
            onClose={handleCloseBlendModal}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={openBlendModal}>
                <Box sx={blendModalStyle}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant="h4" sx={{textAlign: "center"}}>
                                {i18n(appLang, "BLEND_MODAL_TITLE")}
                            </Typography>
                        </Grid>
                        {
                            blendables.bcvNotes.map(
                                bl => <>
                                    <Grid item xs={2} md={1}>
                                        <Checkbox
                                            checked={usedBlendables[`${bl.source}/${bl.transId}/${bl.revision}`]}
                                            onChange={
                                            e => {
                                                const newUsedBlendables = {...usedBlendables};
                                                newUsedBlendables[`${bl.source}/${bl.transId}/${bl.revision}`] = e.target.checked;
                                                setUsedBlendables(newUsedBlendables);
                                            }
                                        }/>
                                    </Grid>
                                    <Grid item xs={10} md={5}>
                                        <Typography>
                                            {`${bl.title} (${bl.language})`}
                                        </Typography>
                                    </Grid>
                                </>
                            )
                        }
                    </Grid>
                </Box>
            </Fade>
        </Modal>
    );
}
