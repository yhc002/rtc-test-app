import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Videocam, VideocamOff, Mic, MicOff } from '@material-ui/icons';
import TextInputPopup from './popups/TextInputPopup';
import { useStyles } from '../MuiTheme';

const HomeUI = ({
    connections, setConnections, setResolution, setRoom, audio, video, room, toggleAudio, toggleVideo, initCall, localStream, isOpen, setIsOpen 
}) => {
    const classes = useStyles();

    return(
        <React.Fragment>
            <main>
                <Grid container id="await-main" spacing={10}>
                    <Grid item>
                        <div id="await-video-container">
                            <video id="await-video" ref={localStream} autoPlay/>
                            <div id='await-video-controls'>
                                <Button variant="contained" className={classes.roundButton} onClick={toggleAudio}>
                                    { audio ? <Mic /> : <MicOff /> }
                                </Button>
                                <Button variant="contained" className={classes.roundButton} onClick={toggleVideo}>
                                    { video? <Videocam /> : <VideocamOff /> }
                                </Button>
                            </div>
                        </div>
                    </Grid>
                    <Grid item className={classes.awaitControls}>
                        <Grid container direction="column" spacing={1} alignItems="center">
                            <Grid item>
                                <div id="await-resoultion-controls">
                                    <Button variant="contained" onClick={()=>setResolution(0)}>qvga</Button>
                                    <Button variant="contained" onClick={()=>setResolution(1)}>vga</Button>
                                    <Button variant="contained" onClick={()=>setResolution(2)}>HD</Button>
                                    <Button variant="contained" onClick={()=>setResolution(3)}>fullHD</Button>
                                    <Button variant="contained" onClick={()=>setResolution(4)}>TV4k</Button>
                                    <Button variant="contained" onClick={()=>setResolution(5)}>cinema4K</Button>
                                    <Button variant="contained" onClick={()=>setResolution(5)}>8K</Button>
                                </div> 
                            </Grid>
                            <Grid item>
                                <Button onClick={()=>setIsOpen(true)}>Connections: {connections}</Button>
                            </Grid>
                            <Grid item>
                                <TextField label="채팅방 id" value={room} onChange={(e)=>setRoom(e.target.value)}/>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Button disabled={!room} variant="contained" onClick={()=>setIsOpen(true)}>
                                            신규 방 생성
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button disabled={!room} variant="contained" onClick={()=>initCall(false)}>
                                            기존 방 입장
                                        </Button>
                                    </Grid>
                                </Grid>
                                
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </main>
            <TextInputPopup
                open={isOpen}
                message="Peer 수 입력"
                label="peer"
                setText={setConnections}
                value={connections}
                submit={()=>{setIsOpen(false); initCall(true)}}
            />
        </React.Fragment>
    )
}

export default HomeUI;