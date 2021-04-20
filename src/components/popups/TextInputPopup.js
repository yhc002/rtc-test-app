import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button'
import Textfield from '@material-ui/core/Textfield';

export default function TextfieldPopup({ open, message, label, setText, submit }) {
    return(
        <Dialog
            open={open}
        >
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
                <Textfield label={label} onChange={(e)=>setText(e.target.value)}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={submit} color="primary">
                    입력
                </Button>
            </DialogActions>
        </Dialog>
    );
}