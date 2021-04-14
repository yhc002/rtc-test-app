import React from 'react';

const HomeUI = ({ history, getMedia, initCall, localStream, foundLocal }) => {
    return(
        <React.Fragment>
            <main>
                <div id="main">
                    <video ref={localStream} autoPlay/>
                    <button onClick={getMedia}>
                        start
                    </button>
                    <button onClick={initCall} disabled={!foundLocal}>
                        call
                    </button>
                </div>
            </main>
        </React.Fragment>
    )
}

export default HomeUI;