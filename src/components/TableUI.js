import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';


const TableUI = ({ tableHead, tableData }) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                {
                    tableHead.map(head => <TableCell>{head}</TableCell>)
                }
                </TableRow>
            </TableHead>
            <TableBody>
            {
                tableData.map(row=>
                    <TableRow>
                    {
                        row.map(data => (
                            <TableCell>
                                {data}
                            </TableCell>
                        ))
                    }
                    </TableRow>
                )
            }
            </TableBody>
        </Table>
    );
}

export default TableUI;