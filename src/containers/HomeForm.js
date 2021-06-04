import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from '../components/HomeUI'
import { setSettings } from '../modules/rtc';
import {videoConstraints } from '../lib/constraints';

const HomeForm = ({ history }) => {
    const { connections, audio, video, resolution } = useSelector(({ rtc }) => ({
        connections: rtc.setting.connections,
        audio: rtc.setting.audio,
        video: rtc.setting.video,
        resolution: rtc.setting.resolution,
    }));
    const dispatch = useDispatch();

    const localStream=useRef();
    const [foundLocal, setFoundLocal] = useState(false);
    const [isOpen,setIsOpen] = useState(false);

    useEffect(()=>{getMedia(resolution)},[]);

    const getMedia = async (res) => {
        try {
            if(localStream.current.srcObject) {
                console.log("stop track")
                localStream.current.srcObject.getTracks().forEach(track => {
                    track.stop();
                });
            }

            await navigator.mediaDevices.getUserMedia({ audio: true, video: res }).then(stream => {
                localStream.current.srcObject = stream;
                const track = stream.getVideoTracks()[0]
                const settings = track.getSettings();
                const controls = document.getElementById('await-video-container');
                controls.style.width = `${settings.width}px`;
                controls.style.height = `${settings.height}px`;
            });
            setFoundLocal(true);
        } catch (e) {
            console.log("getUserMedia error",e)
            setFoundLocal(false);
        }
    }


    const initCall = () => {
        if(localStream.current.srcObject) {
            console.log("stop track")
            localStream.current.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            localStream.current=null;
        }
        history.push('./test');
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        dispatch(setSettings({ connections, video, audio: !audio, resolution }));
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        dispatch(setSettings({ connections, audio, video: !video, resolution }));
    }

    const setResolution = (idx) => {
        dispatch(setSettings({ connections, audio: true, video: true, resolution: videoConstraints[idx] }));
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
            setConnections={(val)=>dispatch(setSettings({ connections: val, audio, video, resolution }))}
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