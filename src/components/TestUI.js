import React from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import { Videocam, VideocamOff, Mic, MicOff, CallEnd, Layers, People } from "@material-ui/icons";
import { useStyles } from '../MuiTheme';
import StatsPopup from './popups/StatsPopup'; 

const TestUI = ({
    audio, video, toggleAudio, toggleVideo, toggleView, hangup, connections, localStreamRef, statsIsOpen, openStats, closeStats, statMessages, isSender, setIsSender,
}) => {
    const classes = useStyles();
    
    return(
        <React.Fragment>
            <div id='my-area'>
                <People />
                <p> {connections}</p>
                <video id="my-video" ref={localStreamRef} autoPlay={true}  />
            </div>
            <main>
                <div id="call-main">
                    <div id="call-videos">
                        {
                            Array.from({ length:connections },(_,i) => <video id={`remote-video ${i}`} onClick={()=>openStats(i)} autoPlay/>)
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
                                    <Button variant="contained" className={classes.roundButton} onClick={hangup}>
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
                isSender={isSender}
                setIsSender={setIsSender}
            />
        </React.Fragment>
    )
}

export default TestUI;