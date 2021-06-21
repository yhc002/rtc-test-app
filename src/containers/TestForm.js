import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import io from "socket.io-client";
import Test from '../components/TestUI'
import { setSettings } from '../modules/rtc';

const TestForm = ({ history }) => {
    const { connections, audio, video, resolution, room } = useSelector(({ rtc }) => ({
        connections: rtc.setting.connections,
        audio: rtc.setting.audio,
        video: rtc.setting.video,
        resolution: rtc.setting.resolution,
        room: rtc.setting.room,
    }));

    const isHost = history.location.state && history.location.state.isHost;
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

    useEffect(() => {
        resizeWindow();
        window.addEventListener('resize', resizeWindow);
        init();
        setSocket(io("https://rtc-test-app.herokuapp.com/"));
        return () => {
            window.removeEventListener('resize', resizeWindow);
        }
      }, []);

    useEffect(() => {
        resizeVideos();
    },[connections]);

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
        } catch (e) {
            console.log("getUserMedia error",e)
        }
    }


    const configSocket = (room) => {
        try{
            socket.emit("enterRoom", room, isHost);
            socket.on("joined",()=>{
                socket.emit("connections-adjusted", room, connections);
                for(let i=0; i<connections; i++) {
                    initCall(i);
                }
                socket.on("signal-to-caller", data => {
                    if(data.signalData.type === "answer") {
                        RTCObjects.current[data.idx].setRemoteDescription(data.signalData);
                        console.log("caller received answer", data)
                    } else if (data.signalData.candidate) {
                        RTCObjects.current[data.idx].addIceCandidate(data.signalData);
                        console.log("caller received candidate", data)
                    } 
                });
            });
            socket.on("offer-to-callee", (data) => {
                console.log("callee received offer", data)
                acceptCall(data.signalData, data.idx);
            });
            socket.on("adjust-connections",(connections)=>dispatch(setSettings({ connections, audio, video, resolution, room })));
            socket.on("candidate-to-callee", (data) => {
                console.log("callee received candidate", data)
                RTCObjects.current[data.idx].addIceCandidate(data.signalData);
            });
            socket.on("close",i => closeRTC(i));
            socket.on("end",()=>{
                hangup(false);
            });
            socket.once("joinResult",(enter, message)=>{
                if(!enter){
                    alert(message);
                    if(localStream.current && localStream.current.srcObject) {
                        localStream.current.srcObject.getTracks().forEach(track => {
                            track.stop();
                        });
                        localStream.current=null;
                    }
                    socket.disconnect();
                    dispatch(setSettings({ connections, audio: true, video: true, resolution, room: '' }));
                    history.push('/')
                }
            });
        } catch(error){
            console.log("room enter error", error);
        }
    }

    const initCall = async (i) => {
        RTCObjects.current[i] = new RTCPeerConnection({
            config: {
                iceServers: [{urls: ['turn:10.186.117.86:3478?transport=udp'], credential: '1234', username: 'test'}],
            },
        });
        RTCObjects.current[i].onicecandidate = (event)=>iceCallbackLocal(event, i);
        if(localStream.current && localStream.current.srcObject) {
            localStream.current.srcObject.getTracks().forEach(track => RTCObjects.current[i].addTrack(track, localStream.current.srcObject));
        }
        RTCObjects.current[i]
            .createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 })
            .then((event)=>onCreateOffer(event,i), onCreateSessionDescriptionError);

        RTCObjects.current[i].ontrack = (event)=>gotRemoteStream(event, i);
    }

    const acceptCall = async (remoteSignal, i) => {
        RTCObjects.current[i] = new RTCPeerConnection({
            config: {
                iceServers: [{urls: ['turn:10.186.117.86:3478?transport=udp'], credential: '1234', username: 'test'}],
            },
        });
        RTCObjects.current[i].onicecandidate = (event)=>iceCallbackRemote(event, i);
        if(localStream.current && localStream.current.srcObject) {
            localStream.current.srcObject.getTracks().forEach(track => RTCObjects.current[i].addTrack(track, localStream.current.srcObject));
        }
        
        RTCObjects.current[i].setRemoteDescription(remoteSignal);

        RTCObjects.current[i].createAnswer().then((event)=>onCreateAnswer(event, i), onCreateSessionDescriptionError);
        RTCObjects.current[i].ontrack = (event)=>gotRemoteStream(event, i);
    }

    function onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
    
    function onCreateOffer(desc, idx) {
        RTCObjects.current[idx].setLocalDescription(desc);
        socket.emit("caller-to-server", { room, signalData: desc, idx, connections });
        console.log('create offer', desc);
    }
      
    function onCreateAnswer(desc, idx) {
        console.log('create answer');
        RTCObjects.current[idx].setLocalDescription(desc);
        socket.emit("callee-to-server", { room, signalData: desc, idx });
    }

    function gotRemoteStream(e, idx) {
        if (remoteRefs.current[idx] !== e.streams[0]) {
            remoteRefs.current[idx] = e.streams[0];
            const vid = document.getElementById(`remote-video ${idx}`);
            if(vid) {
                vid.srcObject = remoteRefs.current[idx];
                console.log(`pc${idx}: set remote stream as srcObject`);
            } else {
                console.log(`pc${idx}: set fail remote stream`, vid);
            }
        } else {
            console.log(`pc${idx}: failed to receive remote stream`)
        }
    }

    function iceCallbackLocal(event, idx) {
        socket.emit("caller-to-server", { room, signalData: event.candidate, idx });
    }
      
    function iceCallbackRemote(event, idx) {
        socket.emit("callee-to-server", { room, signalData: event.candidate, idx });
    }

    const closeRTC = (i) => {
        if(RTCObjects.current[i]) {
            RTCObjects.current[i].close();
            RTCObjects.current[i] = null;
        }
        if(isHost) {
            socket.emit("close",room,i);
        }
    }

    const hangup = (shouldLeave) => {
        for(let i=0;i<connections;i++) {
            closeRTC(i);
        }
        if(shouldLeave) {
            if(localStream.current && localStream.current.srcObject) {
                localStream.current.srcObject.getTracks().forEach(track => {
                    track.stop();
                });
                localStream.current=null;
            }
            if(socket) {
                console.log("should disconnect socket")
                socket.emit("leaveRoom", room);
            }
            dispatch(setSettings({ connections, audio: true, video: true, resolution, room: '' }));
            history.push('/')
        } 
    }

    const adjustConnection = (val) => {
        socket.emit("connections-adjusted",room,val);
        if(val>connections) {
            for(let i=connections;i<val;i++) {
                initCall(i);
            }
        } else {
            for(let i=val;i<connections;i++) {
                closeRTC(i);
            }
        }
        dispatch(setSettings({ connections: val, audio, video, resolution, room }));
    }

    const toggleAudio = () => {
        if(localStream.current.srcObject) {
            localStream.current.srcObject.getAudioTracks()[0].enabled = !audio;
            dispatch(setSettings({ connections, video, audio: !audio, resolution, room }));
        }
    }

    const toggleVideo = () => {
        if(localStream.current.srcObject) {
            localStream.current.srcObject.getVideoTracks()[0].enabled = !video;
            dispatch(setSettings({ connections, audio, video: !video, resolution, room }));
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
            let messages;
            if(RTCObjects.current[idx]){
                const stats = await RTCObjects.current[idx].getStats(null).then(
                    results=>results, err => err.toString()
                )
                messages = stats;
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
            isHost={isHost}
            setConnections={(val)=>adjustConnection(val)}
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
        />
    );
}

export default withRouter(TestForm);