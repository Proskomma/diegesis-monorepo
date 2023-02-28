import { Box, Fade, Modal, Typography } from "@mui/material";
import Backdrop from '@mui/material/Backdrop';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function PrintModal({openPrintModal,handleClosePrintModal,pk}) {

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openPrintModal}
        onClose={handleClosePrintModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openPrintModal}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              This is download Modal
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
