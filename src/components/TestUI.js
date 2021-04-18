import React from 'react';
import { BiCamera, BiCameraOff, BiMicrophone, BiMicrophoneOff, BiPhone } from "react-icons/bi";

const TestUI = ({ audio, video, toggleAudio, toggleVideo, view, toggleView, hangup, connections, localStreamRef, remoteStreamRefs, remoteStreams, isConnected }) => {
    return(
        <React.Fragment>
            <main>
                <div id="call-main">
                    <div id="call-videos">
                        {
                            view == 'sidebar'?
                            <div id="call-videos-sidebar">
                                <div id="focus">
                                    <video id="focus-video" ref={localStreamRef} autoPlay={true}  />
                                </div> 
                                <div id="sidebar">
                                    {Array.from({ length:connections },(_,i) => <video id={`remote-video ${i}`} autoPlay/>)}
                                </div>
                            </div>
                            :
                            <div id="call-videos-tiles">
                                <video ref={localStreamRef} autoPlay={true}  />
                                {Array.from({ length:connections },(_,i) => <video id={`remote-video ${i}`} autoPlay/>)} 
                            </div> 
                        }
                    </div> 
                    <div id="call-controls">
                        <div />
                        <div id="button-group">
                            <button id="round-button" onClick={toggleAudio}>
                                { audio ? <BiMicrophone /> : <BiMicrophoneOff /> }
                            </button>
                            <button id="round-button" onClick={toggleVideo}>
                                { video? <BiCamera /> : <BiCameraOff /> }
                            </button>
                            <button id="round-button" onClick={hangup} disabled={!isConnected}>
                                <BiPhone />
                            </button>
                        </div>
                        <button onClick={toggleView}>view</button>
                    </div>
                </div>
            </main>
        </React.Fragment>
    )
}

export default TestUI;