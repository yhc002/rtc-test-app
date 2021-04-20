import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid';

export default function StatsPopup({ open, messages, confirm }) {
    return(
        <Dialog
            open={open}
            fullWidth
            maxWidth="xl"
        >
            <DialogContent>
                <Grid container wrap="nowrap" justify="space-between" spacing={3}>
                    <Grid item>
                        Local
                        <p>
                            {messages[0]}
                        </p>
                        
                    </Grid>
                    <Grid item>
                        <Divider orientation="vertical" />
                    </Grid>
                    <Grid item>
                        Remote
                        <span>
                            {messages[1]}
                        </span>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={confirm} color="primary">
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
}