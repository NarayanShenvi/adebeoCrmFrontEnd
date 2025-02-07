import {combineReducers} from "redux";
import userReducer from "../redux/slices/authSlice";

const rootReducer = combineReducers({
    data: userReducer
})

export default rootReducer;
