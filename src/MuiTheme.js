import { createMuiTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/styles';

const themePalete = createMuiTheme({
  overrides: {
    MuiGrid: {
      container: {
        height: "100%"
      }
    }
  },
  palette: {
    primary: { main: "#38BF87" },
    secondary: { main: "#ff1a1a" },
  }
})

export const useStyles = makeStyles(() => ({
    roundButton: {
        borderRadius: "50%",
        width: "60px",
        height: "60px",
    }
}));

export default themePalete;