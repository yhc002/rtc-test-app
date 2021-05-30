import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from '../components/HomeUI'
import { setSettings } from '../modules/rtc';
import {videoConstraints } from '../lib/constraints';

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

    useEffect(()=>{getMedia(video)},[]);

    const getMedia = async (vid) => {
        try {
            if(localStream.current.srcObject) {
                console.log("stop track")
                localStream.current.srcObject.getTracks().forEach(track => {
                    track.stop();
                });
            }
            await navigator.mediaDevices.getUserMedia({ audio, video: vid }).then(stream => {
                localStream.current.srcObject = stream;
                const track = stream.getVideoTracks()[0]
                track.applyConstraints({video: vid});
            });
            localStream.current.srcObject.getAudioTracks()[0].enabled = true;
            localStream.current.srcObject.getVideoTracks()[0].enabled = true;
            setFoundLocal(true);
        } catch (e) {
            console.log("getUserMedia error",e)
            setFoundLocal(false);
        }
    }


    const initCall = () => {
        history.push('./test');
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        dispatch(setSettings({ connections, video, audio: !audio }));
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        dispatch(setSettings({ connections, audio, video: !video }));
    }

    const setResolution = (idx) => {
        dispatch(setSettings({ connections, audio, video: videoConstraints[idx] }));
        getMedia(videoConstraints[idx]);
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
            setResolution={setResolution}
            localStream={localStream}
            foundLocal={foundLocal}
            history={history} 
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
};

export default withRouter(HomeForm);