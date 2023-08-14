import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const DeleteConfirmationDialog = ({ open = false, handleClose = (res = 'cancel', deletableItem = undefined) => { }, title = '', description = '', deletableItem }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button  onClick={() => { handleClose('ok', deletableItem) }} color={'red'}>
                    Delete
                </Button>
                <Button variant={'contained'} onClick={() => { handleClose('cancel', deletableItem) }} autoFocus>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteConfirmationDialog