import React from 'react';
import { BiCamera, BiCameraOff, BiMicrophone, BiMicrophoneOff } from "react-icons/bi";

const HomeUI = ({ connections, setConnections, audio, video, toggleAudio, toggleVideo, initCall, localStream, foundLocal }) => {
    return(
        <React.Fragment>
            <main>
                <div id="await-main">
                    <div id="await-video-container">
                        <video id="await-video" ref={localStream} autoPlay/>
                        <div id='await-video-controls'>
                            <button id="round-button" onClick={toggleAudio}>
                                { audio ? <BiMicrophone /> : <BiMicrophoneOff /> }
                            </button>
                            <button id="round-button" onClick={toggleVideo}>
                                { video? <BiCamera /> : <BiCameraOff /> }
                            </button>
                        </div>   
                    </div>
                    <div id="await-controls">
                        <span>Connections: {connections}</span>
                        <div id="button-group">
                            <button id="round-button" onClick={()=>setConnections(connections+1)} disabled={connections>=5}>
                                +
                            </button>
                            <button id="round-button" onClick={()=>setConnections(connections-1)} disabled={connections<=1}>
                                -
                            </button>
                        </div>
                        <button onClick={initCall} disabled={!foundLocal}>
                            지금 참여하기
                        </button>
                    </div>
                </div>
            </main>
        </React.Fragment>
    )
}

export default HomeUI;