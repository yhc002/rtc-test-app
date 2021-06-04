import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button'
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TableUI from '../TableUI';

export default function StatsPopup({ open, messages, confirm, isSender, setIsSender }) {
    const tableData={}
    const ids=[]
    messages[isSender==="sender" ? 0 : 1].forEach(report => {
        let datas=[];
        ids.push(report.id)
        let key;
        for(key in report){
            datas.push([key,report[key]])
        }
        tableData[report.id] = datas;
    });

    return(
        <Dialog
            open={open}
            fullWidth
            maxWidth="xl"
        >
            <DialogContent>
                <RadioGroup value={isSender} onChange={e=>{console.log('isSender',e.target.value,isSender); setIsSender(e.target.value)}}>
                    <FormControlLabel value="sender" label="Sender" control={<Radio />} />
                    <FormControlLabel value="receiver" label="Receiver" control={<Radio />} />
                </RadioGroup>
                {
                    ids.map(id => (
                        <details>
                            <summary>{id}</summary>
                            <TableUI
                                tableHead={["parameter", "value"]}
                                tableData={tableData[id]}
                            />
                        </details>
                    ))
                }
                
            </DialogContent>
            <DialogActions>
                <Button onClick={confirm} color="primary">
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
}