import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Test from '../components/TestUI'
import { setSettings } from '../modules/rtc';

const TestForm = ({ history }) => {
    const { connections, audio, video } = useSelector(({ rtc }) => ({
        connections: rtc.setting.connections,
        audio: rtc.setting.audio,
        video: rtc.setting.video,
    }));
    const dispatch = useDispatch();

    const localStream=useRef();
    const RTCObjects =useRef(Array.from({ length:connections },() => {return { pcLocal: null , pcRemote: null }}));

    const remoteRefs = useRef(Array.from({ length:connections },() => null))

    const [view,setView] = useState('sidebar')

    const [statsIsOpen, setStatsIsOpen] = useState(false);
    const [statMessages, setStatMessages] = useState([[],[]]);
    const [statInterval, setStatInterval] = useState(null);
    const [isSender, setIsSender] = useState("sender");

    useEffect(() => {
        console.log('init!', history)
        init();
    },[]);

    useEffect(() => {
        let vid;
        let height; 
        let width;
        let n;
        if(view==="sidebar"){
            height=100/connections;
        } else {
            n = Math.ceil(Math.sqrt(Math.min(connections,49)))
            width=100/n;
            height=100/n;
        }
        for(let idx=0;idx<connections;idx++) {
            vid = document.getElementById(`remote-video ${idx}`);
            console.log("vid width", vid.getBoundingClientRect());
            if(view==="sidebar") {
                vid.style.display="block";
                vid.style.position="absolute";
                if(idx===0){
                    vid.style.left=0;
                    vid.style.width="80vw"; 
                    vid.style.height="100%";
                } else {
                    vid.style.height=`calc(${height}% - ${64/(connections-1)}px)`;
                    vid.style.top=`calc(64px + ${height*(idx-1)}% - ${64/(connections-1)*(idx-1)}px)`;
                    vid.style.width="20vw";
                    vid.style.left="80vw";
                }
            } else {
                if(idx>49){
                    vid.style.display="none";
                }
                vid.style.position="relative";
                vid.style.left=0;
                vid.style.top=0;
                vid.style.width=`${width}%`;
                vid.style.height=`${height}%`;
            }
            if(vid && !vid.srcObject) { vid.srcObject = remoteRefs.current[idx] }
            
        }
    },[view])


    const init = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
                localStream.current.srcObject = stream;
                console.log("New LocalStream")
            });
            localStream.current.srcObject.getAudioTracks()[0].enabled = audio;
            localStream.current.srcObject.getVideoTracks()[0].enabled = video;
            call();
        } catch (e) {
            console.log("getUserMedia error",e)
        }
    }

    const call = async () => {
        for(let i=0; i<connections; i++) {
            RTCObjects.current[i].pcLocal = new RTCPeerConnection(null);
            RTCObjects.current[i].pcRemote = new RTCPeerConnection(null);

            RTCObjects.current[i].pcRemote.ontrack = (event)=>gotRemoteStream(event, i);
            RTCObjects.current[i].pcLocal.onicecandidate = (event)=>iceCallbackLocal(event, i);
            RTCObjects.current[i].pcRemote.onicecandidate = (event)=>iceCallbackRemote(event, i);

            localStream.current.srcObject.getTracks().forEach(track => RTCObjects.current[i].pcLocal.addTrack(track, localStream.current.srcObject));

            RTCObjects.current[i].pcLocal
                .createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 })
                .then((event)=>gotDescriptionLocal(event,i), onCreateSessionDescriptionError);
        }
    }

    function onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
    
    function gotDescriptionLocal(desc, idx) {
        RTCObjects.current[idx].pcLocal.setLocalDescription(desc);
        console.log(`Offer from pc${idx}Local\n${desc.sdp}`);
        RTCObjects.current[idx].pcRemote.setRemoteDescription(desc);
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        RTCObjects.current[idx].pcRemote.createAnswer().then((event)=>gotDescriptionRemote(event, idx), onCreateSessionDescriptionError);
    }
      
    function gotDescriptionRemote(desc, idx) {
        RTCObjects.current[idx].pcRemote.setLocalDescription(desc);
        console.log(`Answer from pc${idx}Remote\n${desc.sdp}`);
        RTCObjects.current[idx].pcLocal.setRemoteDescription(desc);
    }

    function gotRemoteStream(e, idx) {
        if (remoteRefs.current[idx] !== e.streams[0]) {
            remoteRefs.current[idx] = e.streams[0];
            const vid = document.getElementById(`remote-video ${idx}`);
            if(vid) { vid.srcObject = remoteRefs.current[idx] }
            console.log(`pc${idx}: received remote stream`);
        } else {
            console.log("test failed!")
        }
    }

    function iceCallbackLocal(event, idx) {
        console.log("iceCallback",event, idx)
        handleCandidate(event.candidate, RTCObjects.current[idx].pcRemote, `pc${idx}: `, 'local');
    }
      
    function iceCallbackRemote(event, idx) {
        handleCandidate(event.candidate, RTCObjects.current[idx].pcLocal, `pc${idx}: `, 'remote');
    }
      
    function handleCandidate(candidate, dest, prefix, type) {
        dest.addIceCandidate(candidate)
            .then(onAddIceCandidateSuccess, onAddIceCandidateError);
        console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
    }
      
    function onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }
      
    function onAddIceCandidateError(error) {
        console.log(`Failed to add ICE candidate: ${error.toString()}`);
    }

    function hangup() {
        console.log('Ending calls');
        
        for(let i=0;i<connections;i++) {
            if(RTCObjects.current[i].pcLocal)
                RTCObjects.current[i].pcLocal.close();
            if(RTCObjects.current[i].pcRemote)
                RTCObjects.current[i].pcRemote.close();
            RTCObjects.current[i].pcLocal = null;
            RTCObjects.current[i].pcRemote = null;
        }

        history.push('/')
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        dispatch(setSettings({ connections, video, audio: !audio }));
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        dispatch(setSettings({ connections, audio, video: !video }));
    }

    const toggleView = () => {
        if(view === "sidebar"){
            setView("tiles")
        } else {
            setView("sidebar")
        }
    }

    const openStats = (idx) => {
        if(statInterval) {
            clearInterval(statInterval);
        }
        const interval = setInterval(async ()=>{
            let messages=['',''];
            if(RTCObjects.current[idx] && RTCObjects.current[idx].pcLocal){
                const localStat = await RTCObjects.current[idx].pcLocal.getStats(null).then(
                    results=>results, err => err.toString()
                )
                messages[0] = localStat;
            }
            if(RTCObjects.current[idx] && RTCObjects.current[idx].pcRemote){
                const remoteStat = await RTCObjects.current[idx].pcRemote.getStats(null).then(
                    results=>results, err => err.toString()
                )
                messages[1] = remoteStat;
            }
            setStatMessages(messages);
        },1000);
        setStatInterval(interval);
        setStatsIsOpen(true);
    }

    const closeStats = () => {
        clearInterval(statInterval);
        setStatsIsOpen(false);
        setStatInterval(null);
    }

    return(
        <Test
            audio={audio}
            video={video}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            toggleView={toggleView}
            hangup={()=>hangup('/')}
            connections={connections}
            localStreamRef={localStream}
            remoteStreamRefs={remoteRefs}
            statsIsOpen={statsIsOpen}
            openStats={(idx)=>openStats(idx)}
            closeStats={closeStats}
            statMessages={statMessages}
            isSender={isSender}
            setIsSender={setIsSender}
        />
    );
}

export default withRouter(TestForm);