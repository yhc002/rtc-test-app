import React from 'react';

const TestUI = ({ history, init, call, hangup, connections, localStreamRef, remoteStreamRefs, foundLocal, isConnected }) => {
    return(
        <React.Fragment>
            <main>
                <div id="main">
                    <p>
                        Demo 2: RTCPeerConnection을 이용하여 영상을 송수신합니다.
                    </p>
                    <div id="demo2layout">
                        <div id="demo2sublayout">
                            {/* 송신자의 영상 */}
                            <video ref={localStreamRef} autoPlay={true}  /> 
                            <button onClick={init} disabled={foundLocal}>
                                디바이스 연결
                            </button>
                        </div>

                        <div id="demo2sublayout">
                            {/* 수신자의 영상 */}
                            {/* <video ref={remoteStreamRefs} autoPlay={true}  />  */}
                            {remoteStreamRefs.map(ref=><video ref={ref} autoPlay={true}  />)}
                            <div id="button-group">
                                <button id="positive" onClick={()=>call()} disabled={!foundLocal||isConnected}>
                                    통화
                                </button>
                                <button id="negative" onClick={hangup} disabled={!isConnected}>
                                    통화 끊기
                                </button>
                            </div>
                        </div>
                    </div>
                    <button id="go-back" onClick={()=>history.push('/')}>
                        돌아가기
                    </button>
                </div>
            </main>
        </React.Fragment>
    )
}

export default TestUI;