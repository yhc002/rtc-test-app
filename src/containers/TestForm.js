import React, { useEffect, useState, useRef, createRef } from 'react';
import { withRouter } from 'react-router-dom';
import Test from '../components/TestUI'

const TestForm = ({ history }) => {
    const connections = history.location? history.location.state.connections : 1;

    const localStream=useRef();
    const RTCObjects =useRef(Array.from({ length:connections },() => {return { pcLocal: null , pcRemote: null }}));
    //const remoteRefs = useRef([]);
    const remoteRefs = useRef(Array.from({ length:connections },() => null))
    const [isConnected, setIsConnected] = useState(false);

    const [audio, setAudio] = useState(history.location? history.location.state.audio : true);
    const [video, setVideo] = useState(history.location? history.location.state.video : true);

    const [view,setView] = useState('sidebar')

    useEffect(() => {
        console.log('init!')
        hangup(false);
        init();
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
            setIsConnected(true)
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

    function hangup(isLeave) {
        console.log('Ending calls');
        
        for(let i=0;i<connections;i++) {
            if(RTCObjects.current[i].pcLocal)
                RTCObjects.current[i].pcLocal.close();
            if(RTCObjects.current[i].pcRemote)
                RTCObjects.current[i].pcRemote.close();
            RTCObjects.current[i].pcLocal = null;
            RTCObjects.current[i].pcRemote = null;
        }
        setIsConnected(false)
        if(isLeave)
            history.push('/');
    }

    const toggleAudio = () => {
        localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
        setAudio(!audio);
    }

    const toggleVideo = () => {
        localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
        setVideo(!video);
    }

    const toggleView = () => {
        if(view=="sidebar"){
            setView("tiles")
        } else {
            setView("sidebar")
        }
    }

    const checkStats = async (idx) => {
        if(RTCObjects.current[idx].pcLocal){
            await RTCObjects.current[idx].pcLocal.getStats(null).then(
                showRemoteStats, err => console.log(err)
            )
        }
        if(RTCObjects.current[idx].pcRemote){
            await RTCObjects.current[idx].pcRemote.getStats(null).then(
                showLocalStats, err => console.log(err)
            )
        }
    }

    const showRemoteStats = (results) => {
        results.forEach(report => {
            if(report.id.indexOf('sender')>0)
                console.log('stats remote',report)
        })
    }
    const showLocalStats = (results) => {
        results.forEach(report => {
            if(report.id.indexOf('receiver')>0)
                console.log('stats local receiver',report)
            if(report.id.indexOf('Stream')>0)
            console.log('stats local Stream',report)
        })
    }

    return(
        <Test
            audio={audio}
            video={video}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            view={view}
            toggleView={toggleView}
            hangup={()=>hangup(true)}
            connections={connections}
            localStreamRef={localStream}
            remoteStreamRefs={remoteRefs}
            isConnected={isConnected}
            checkStats={checkStats}
        />
    );
}

export default withRouter(TestForm);