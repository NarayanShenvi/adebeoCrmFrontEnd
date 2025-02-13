import {combineReducers} from "redux";
// import userReducer from "../redux/slices/authSlice";
import funnelReducer from './slices/funnelSlice';  // Adjust path
import customerReducer from "./slices/customerSlice"

const rootReducer = combineReducers({
    //data: userReducer
    funnel: funnelReducer,  // Add your other slices here if necessary
    customers:customerReducer
    
})

export default rootReducer;

