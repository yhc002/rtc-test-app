import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button'
import TableUI from '../TableUI';

export default function StatsPopup({ open, messages, confirm }) {
    const tableData={}
    const ids=[]
    messages.forEach(report => {
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