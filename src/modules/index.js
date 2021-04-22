import { combineReducers } from 'redux';
import rtc from './rtc';


const appReducer = combineReducers({
  rtc,
});

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer;
