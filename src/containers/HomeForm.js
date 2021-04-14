import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Home from '../components/HomeUI'

const HomeForm = ({ history }) => {
    const localStream=useRef();
    const [foundLocal, setFoundLocal] = useState(false);

    const getMedia = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(stream => {
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
        history.push('./test')
    }

    return (
        <Home
            getMedia={getMedia}
            initCall={initCall}
            localStream={localStream}
            foundLocal={foundLocal}
            history={history} 
        />
    );
};

export default withRouter(HomeForm);