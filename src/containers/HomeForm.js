import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Home from '../components/HomeUI'


const HomeForm = ({ history }) => {
    const localStream=useRef();
    const [foundLocal, setFoundLocal] = useState(false);
    const [connections, setConnections] = useState(1);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);

    useEffect(()=>{getMedia()},[]);

    const getMedia = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
                localStream.current.srcObject = stream;
                console.log("New LocalStream")
            });
            setFoundLocal(true);
        } catch (e) {
            console.log("getUserMedia error",e)
            setFoundLocal(false);
        }
    }

    const initCall = () => {
        console.log("audio & video",audio,video)
        history.push('./test', { connections, audio, video })
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        setAudio(!audio);
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        setVideo(!video);
    }

    return (
        <Home
            audio={audio}
            video={video}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            initCall={initCall}
            connections={connections}
            setConnections={setConnections}
            localStream={localStream}
            foundLocal={foundLocal}
            history={history} 
        />
    );
};

export default withRouter(HomeForm);