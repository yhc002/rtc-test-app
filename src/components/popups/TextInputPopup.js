import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button'
import Textfield from '@material-ui/core/Textfield';

export default function TextfieldPopup({ open, message, label, setText, value, cancel, submit }) {
    const handleInput = (e) => {
        let val = Number(e.target.value);
        if(val>100) {
            val=100;
        }
        if(val<1) {
            val=1;
        }
        setText(val);
    }

    return(
        <Dialog
            open={open}
        >
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
                <Textfield
                    label={label}
                    type="number"
                    onChange={handleInput}
                    inputProps={{min:1,max:100}}
                    value={value}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel} color="primary">
                    취소
                </Button>
                <Button onClick={submit} color="primary">
                    입력
                </Button>
            </DialogActions>
        </Dialog>
    );
}