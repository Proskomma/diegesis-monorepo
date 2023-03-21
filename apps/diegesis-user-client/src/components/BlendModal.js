import {
  Box,
  Fade,
  Modal,
  Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { useContext} from "react";
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
}) {
  const appLang = useContext(AppLangContext);

  return (
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openBlendModal}
        onClose={handleCloseBlendModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openBlendModal}>
          <Box sx={blendModalStyle}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {i18n(appLang, "BLEND_MODAL_TITLE")}
            </Typography>
           </Box>
        </Fade>
      </Modal>
  );
}
