import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from '../components/HomeUI'
import { setSettings } from '../modules/rtc';


const HomeForm = ({ history }) => {
    const { connections, audio, video } = useSelector(({ rtc }) => ({
        connections: rtc.setting.connections,
        audio: rtc.setting.audio,
        video: rtc.setting.video,
    }));
    const dispatch = useDispatch();

    const localStream=useRef();
    const [foundLocal, setFoundLocal] = useState(false);
    const [isOpen,setIsOpen] = useState(false);

    useEffect(()=>{getMedia()},[]);

    const getMedia = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
                localStream.current.srcObject = stream;
                console.log("New LocalStream")
            });
            localStream.current.srcObject.getAudioTracks()[0].enabled = audio;
            localStream.current.srcObject.getVideoTracks()[0].enabled = video;
            setFoundLocal(true);
        } catch (e) {
            console.log("getUserMedia error",e)
            setFoundLocal(false);
        }
    }

    const initCall = () => {
        history.push('./test')
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        dispatch(setSettings({ connections, video, audio: !audio }));
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        dispatch(setSettings({ connections, audio, video: !video }));
    }

    return (
        <Home
            audio={audio}
            video={video}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            initCall={initCall}
            connections={connections}
            setConnections={(val)=>dispatch(setSettings({ connections: val, audio, video }))}
            localStream={localStream}
            foundLocal={foundLocal}
            history={history} 
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
};

export default withRouter(HomeForm);