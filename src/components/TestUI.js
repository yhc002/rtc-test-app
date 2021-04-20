import React from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import { Videocam, VideocamOff, Mic, MicOff, CallEnd, Layers } from "@material-ui/icons";
import { useStyles } from '../MuiTheme';
import StatsPopup from './popups/StatsPopup'; 

const TestUI = ({ audio, video, toggleAudio, toggleVideo, view, toggleView, hangup, connections, localStreamRef, isConnected, statsIsOpen, openStats, closeStats, statMessages }) => {
    const classes = useStyles();
    
    return(
        <React.Fragment>
            <video id="my-video" ref={localStreamRef} autoPlay={true}  />
            <main>
                <div id="call-main">
                    <div id="call-videos">
                        {
                            view == 'sidebar'?
                            
                            <div id="call-videos-sidebar">
                                <div>
                                    <video id="remote-video 0" autoPlay/>
                                </div>
                                <div id="sidebar">
                                    {Array.from({ length:connections },(_,i) => <video id={`remote-video ${i}`} onClick={()=>openStats(i)} autoPlay/>)}
                                </div>
                            </div>
                            :
                            <div id="call-videos-tiles">
                                {Array.from({ length:connections },(_,i) => <video id={`remote-video ${i}`} autoPlay/>)} 
                            </div> 
                        }
                    </div> 
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item/>
                        <Grid item>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <Button variant="contained" className={classes.roundButton} onClick={toggleAudio}>
                                        { audio ? <Mic /> : <MicOff /> }
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" className={classes.roundButton} onClick={toggleVideo}>
                                        { video? <Videocam /> : <VideocamOff /> }
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" className={classes.roundButton} onClick={hangup} disabled={!isConnected}>
                                        <CallEnd />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" className={classes.roundButton} onClick={toggleView}>
                                <Layers />
                            </Button>
                        </Grid>  
                    </Grid>
                </div>
            </main>
            <StatsPopup
                open={statsIsOpen}
                messages={statMessages}
                confirm={closeStats}
            />
        </React.Fragment>
    )
}

export default TestUI;