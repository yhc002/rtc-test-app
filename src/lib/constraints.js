const qvgaConstraints = { width: {exact: 320}, height: {exact: 240} };

const vgaConstraints = { width: {exact: 640}, height: {exact: 480} };

const hdConstraints =  { width: {exact: 1280}, height: {exact: 720} };

const fullHdConstraints = { width: {exact: 1920}, height: {exact: 1080} };

const televisionFourKConstraints = { width: {exact: 3840}, height: {exact: 2160} };

const cinemaFourKConstraints = { width: {exact: 4096}, height: {exact: 2160} };

const eightKConstraints = { width: {exact: 7680}, height: {exact: 4320} };

export const videoConstraints = [qvgaConstraints, vgaConstraints, hdConstraints, fullHdConstraints, televisionFourKConstraints, cinemaFourKConstraints, eightKConstraints]
