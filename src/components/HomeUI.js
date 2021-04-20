import React from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import { Videocam, VideocamOff, Mic, MicOff } from "@material-ui/icons";
import { useStyles } from '../MuiTheme';

const HomeUI = ({ connections, setConnections, audio, video, toggleAudio, toggleVideo, initCall, localStream, foundLocal }) => {
    const classes = useStyles();

    return(
        <React.Fragment>
            <main>
                <Grid container id="await-main" spacing={10}>
                    <Grid item className={classes.awaitVideoContainer}>
                        <video id="await-video" ref={localStream} autoPlay/>
                        <div id='await-video-controls'>
                            <Button variant="contained" className={classes.roundButton} onClick={toggleAudio}>
                                { audio ? <Mic /> : <MicOff /> }
                            </Button>
                            <Button variant="contained" className={classes.roundButton} onClick={toggleVideo}>
                                { video? <Videocam /> : <VideocamOff /> }
                            </Button>
                        </div>   
                    </Grid>
                    <Grid item>
                        <Grid container direction="column" spacing={1} alignItems="center">
                            <Grid item>
                                <span>Connections: {connections}</span>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Button variant="contained" className={classes.roundButton} onClick={()=>setConnections(connections+1)} disabled={connections>=5}>
                                            +
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" className={classes.roundButton} onClick={()=>setConnections(connections-1)} disabled={connections<=1}>
                                            -
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" onClick={initCall} disabled={!foundLocal}>
                                    지금 참여하기
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </main>
            <dialog open={connections==3}>test dialog</dialog>
        </React.Fragment>
    )
}

export default HomeUI;