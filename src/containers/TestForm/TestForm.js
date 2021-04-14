import React, { useEffect, useState, useRef, createRef } from 'react';
import { withRouter } from 'react-router-dom';
import Test from '../../components/TestUI'

const TestForm = ({ history }) => {
    const localStream=useRef();
    const RTCObjects =useRef(Array.from({ length:100 },() => {return { pcLocal: null , pcRemote: null }}));
    const [remoteRefs, setRemoteRefs]=useState([]);
    // const remoteRefs = Array.from({length: 100}, () => createRef())

    const [connections, setConnections] = useState(3);
    const [foundLocal, setFoundLocal] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };

    useEffect(() => {
        console.log('init!')
        init();
    },[])

    useEffect(() => {
        console.log("connection")
        setRemoteRefs(remoteRefs => (
            Array(connections).fill().map((_,i) => remoteRefs[i] || createRef())
        ));
    },[connections]);

    const init = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(stream => {
                localStream.current.srcObject = stream;
                console.log("New LocalStream")
            });
            setFoundLocal(true);
            // call();
        } catch (e) {
            console.log("getUserMedia error",e)
            setFoundLocal(false);
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
                .createOffer(offerOptions)
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
        if (RTCObjects.current[idx].stream !== e.streams[0]) {
            remoteRefs[idx].current.srcObject = e.streams[0];
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
        setIsConnected(false)
    }

    return(
        <Test
            history={history}
            init={init}
            call={call}
            hangup={hangup}
            connections={connections}
            localStreamRef={localStream}
            remoteStreamRefs={remoteRefs}
            foundLocal={foundLocal}
            isConnected={isConnected}
        />
    );
}

export default withRouter(TestForm);