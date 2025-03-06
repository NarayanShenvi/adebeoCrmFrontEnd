import {combineReducers} from "redux";
// import userReducer from "../redux/slices/authSlice";
import funnelReducer from './slices/funnelSlice';  // Adjust path
import customerReducer from "./slices/customerSlice";
import productReducer from './slices/productSlice';// Import the products slice
import  quoteReducer  from './slices/quoteSlice';
import proformaReducer  from './slices/proformaSlice';
import purchaseOderReducer from './slices/purchaseOrderSlice';

const rootReducer = combineReducers({
    //data: userReducer
    funnel: funnelReducer,  // Add your other slices here if necessary
    customers:customerReducer,
    products:productReducer,
    quote: quoteReducer,
    proformaInvoice:proformaReducer,
    purchaseOrder:purchaseOderReducer
})

export default rootReducer;

