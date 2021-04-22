import { createAction, handleActions } from 'redux-actions';

const SET_SETTINGS = "rtc/SET_SETTINGS";

const initialState = {
    setting: {
        connections: 1,
        audio: true,
        video: true,
    }
}

export const setSettings = createAction(SET_SETTINGS, settings => settings);

const rtc = handleActions(
    {
        [SET_SETTINGS]: (state, { payload: setting })=>({
            ...state,
            setting,
        }),
    },
    initialState
);

export default rtc;