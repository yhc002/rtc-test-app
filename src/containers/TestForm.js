import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import io from "socket.io-client";
import Test from '../components/TestUI'
import { setSettings } from '../modules/rtc';

const TestForm = ({ history }) => {
    const { connections, audio, video, resolution } = useSelector(({ rtc }) => ({
        connections: rtc.setting.connections,
        audio: rtc.setting.audio,
        video: rtc.setting.video,
        resolution: rtc.setting.resolution,
    }));
    const room=1;
    const dispatch = useDispatch();

    const localStream=useRef();
    const RTCObjects =useRef(Array.from({ length: 100 },() => null));

    const [socket, setSocket] = useState(null);

    const remoteRefs = useRef(Array.from({ length: 100 },() => null))

    const [areaWidth, setAreaWidth] = useState(0);
    const [areaHeight, setAreaHeight] = useState(0);
    const [view,setView] = useState('sidebar')

    const [statsIsOpen, setStatsIsOpen] = useState(false);
    const [statMessages, setStatMessages] = useState([[],[]]);
    const [statInterval, setStatInterval] = useState(null);
    const [isSender, setIsSender] = useState("sender");

    useEffect(() => {
        resizeWindow();
        window.addEventListener('resize', resizeWindow);
        return () => { // cleanup 
          window.removeEventListener('resize', resizeWindow);
        }
      }, []);

    useEffect(() => {
        hangup(false);
        init();
        resizeVideos();
    },[connections]);

    //initiate after socket is set
    useEffect(() => {
        if(socket)
        {
            configSocket(room)
        }
    }, [socket])

    useEffect(() => {
        resizeVideos();
    },[view, areaHeight, areaWidth])

    const resizeWindow = () => {
        const area = document.getElementById('call-videos');
        setAreaWidth(area.offsetWidth);
        setAreaHeight(area.offsetHeight);
    }

    const resizeVideos = () => {
        let vid;
        let vidContainer;
        for(let idx=0;idx<connections;idx++) {
            vid = document.getElementById(`remote-video ${idx}`);
            vidContainer = document.getElementById(`remote-container ${idx}`)
            if(areaWidth>areaHeight) {
                vid.style.width="100%";
                vid.style.height="auto";
            } else {
                vid.style.width="auto";
                vid.style.height="100%";
            }
            if(view==="sidebar") {
                vidContainer.style.display="block";
                vidContainer.style.position="absolute";
                if(idx===0){
                    vidContainer.style.left=0;
                    vidContainer.style.width=`${areaWidth-220}px`; 
                    vidContainer.style.height="100%";
                } else if(idx>5){
                    vidContainer.style.display="none";
                } else {
                    vidContainer.style.right=0;
                    vidContainer.style.width="218px";
                    vidContainer.style.height="123px";
                    vidContainer.style.top=`${123*Math.min(idx-1,6)+64}px`
                }
            } else {
                vidContainer.style.display="block";
                vidContainer.style.top="auto";
                vidContainer.style.left="auto";
                vidContainer.style.right="auto";
                if(idx>49){
                    vidContainer.style.display="none";
                }
                vidContainer.style.position="relative";
                vidContainer.style.width=`${areaWidth/Math.ceil(Math.sqrt(Math.min(connections,49)))}px`;
                vidContainer.style.height=`${areaHeight/Math.ceil(Math.sqrt(Math.min(connections,49)))}px`
            }
        }
    }

    const init = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: audio || true, video: video ? resolution : true }).then(stream => {
                localStream.current.srcObject = stream;
            });
            localStream.current.srcObject.getAudioTracks()[0].enabled = audio;
            localStream.current.srcObject.getVideoTracks()[0].enabled = video;
            setSocket(io("http://192.168.0.3:8000"));
        } catch (e) {
            console.log("getUserMedia error",e)
        }
    }

    //attempt to create/enter room
    const configSocket = (room) => {
        try{
            //emit message requesting to enter/create room
            socket.emit("enterRoom", room);
            //procedure to handle situation where an opponent entered the room
            socket.on("joined",()=>{ initCall() });
            //handle offer received
            socket.on("offer-to-callee", (data) => {
                console.log("received offer", data)
                acceptCall(data.signalData, data.idx);
            });
            //handle ending phone call
            // socket.on("end",(message)=>{
            //     setEndMessage(message);
            //     setEndPopup(true);
            // });
            socket.once("joinResult",(result)=>{
                console.log('joinResult',result);
            });
        } catch(error){
            console.log("room enter error", error);
        }
    }

    const initCall = async () => {
        for(let i=0;i<connections;i++) {
            RTCObjects.current[i] = new RTCPeerConnection(null);
            RTCObjects.current[i].onicecandidate = (event)=>iceCallbackLocal(event, i);
            if(localStream.current && localStream.current.srcObject) {
                localStream.current.srcObject.getTracks().forEach(track => RTCObjects.current[i].addTrack(track, localStream.current.srcObject));
            }
            RTCObjects.current[i]
                .createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 })
                .then((event)=>gotDescriptionLocal(event,i), onCreateSessionDescriptionError);

            RTCObjects.current[i].ontrack = (event)=>gotRemoteStream(event, i);
        }
         //handle answer message
         socket.on("signal-to-caller", data => {
            console.log("signal-to-caller", data)
            if(data.signalData.type === "answer") {
                RTCObjects.current[data.idx].setRemoteDescription(data.signalData);
            } else if(data.signalData.type === "candidate") {
                RTCObjects.current[data.idx].addIceCandidate(data.signalData);
            }
        });
    }

    const acceptCall = async (remoteSignal, i) => {
        RTCObjects.current[i] = new RTCPeerConnection(null);
        RTCObjects.current[i].ontrack = (event)=>gotRemoteStream(event, i);
        RTCObjects.current[i].onicecandidate = (event)=>iceCallbackRemote(event, i);
        if(localStream.current && localStream.current.srcObject) {
            localStream.current.srcObject.getTracks().forEach(track => RTCObjects.current[i].addTrack(track, localStream.current.srcObject));
        }
        
        RTCObjects.current[i].setRemoteDescription(remoteSignal);

        RTCObjects.current[i].createAnswer().then((event)=>gotDescriptionRemote(event, i), onCreateSessionDescriptionError);
        //handle candidate messages
        socket.on("candidate-to-callee", (data) => {
            console.log("callee received candidate", data)
            RTCObjects.current[data.idx].addIceCandidate(data.signalData);
        });
    }

    function onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
    
    function gotDescriptionLocal(desc, idx) {
        RTCObjects.current[idx].setLocalDescription(desc);
        socket.emit("caller-to-server", { room, signalData: desc, idx });
        console.log(`Offer from pc${idx}Local\n${desc.sdp}`);
        // RTCObjects.current[idx].pcRemote.setRemoteDescription(desc);
        // RTCObjects.current[idx].pcRemote.createAnswer().then((event)=>gotDescriptionRemote(event, idx), onCreateSessionDescriptionError);
    }
      
    function gotDescriptionRemote(desc, idx) {
        // RTCObjects.current[idx].pcRemote.setLocalDescription(desc);
        // console.log(`Answer from pc${idx}Remote\n${desc.sdp}`);
        RTCObjects.current[idx].setLocalDescription(desc);
        socket.emit("callee-to-server", { room, signalData: desc, idx });
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
        socket.emit("caller-to-server", { room, signalData: event.candidate, idx });
        // handleCandidate(event.candidate, RTCObjects.current[idx].pcRemote, `pc${idx}: `, 'local');
    }
      
    function iceCallbackRemote(event, idx) {
        socket.emit("callee-to-server", { room, signalData: event.candidate, idx });
        // handleCandidate(event.candidate, RTCObjects.current[idx].pcLocal, `pc${idx}: `, 'remote');
    }
      
    function hangup(shouldLeave) {
        for(let i=0;i<connections;i++) {
            if(RTCObjects.current[i])
                RTCObjects.current[i].close();
            RTCObjects.current[i] = null;
        }
        if(shouldLeave) {
            if(localStream.current.srcObject) {
                localStream.current.srcObject.getTracks().forEach(track => {
                    track.stop();
                });
                localStream.current=null;
            }
            socket.emit("leaveRoom", room);
            setSocket(null);
            dispatch(setSettings({ connections, audio: true, video: true, resolution }));
            history.push('/')
        } 
    }

    const toggleAudio = () => {
        if(localStream.current.srcObject) {
            localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
            dispatch(setSettings({ connections, video, audio: !audio, resolution }));
        }
    }

    const toggleVideo = () => {
        if(localStream.current.srcObject) {
            localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
            dispatch(setSettings({ connections, audio, video: !video, resolution }));
        }
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
            setConnections={(val)=>dispatch(setSettings({ connections: val, audio, video, resolution }))}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            toggleView={toggleView}
            hangup={()=>hangup(true)}
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