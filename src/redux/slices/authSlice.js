import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../../config/config";  // Importing API from config file

//const API = "https://adebeo-crm1.onrender.com";

const initialState = {
  user: null, // Initially no user is logged in
  error: null, // Track login errors
  loading: false, // Optional: track if login is in progress
};

// Create slice using createSlice
const userSlice = createSlice({
  name: "user", // Name of the slice
  initialState,
  reducers: {
    // Reducer for successful login
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.error = null;
    }
    // Reducer for login failure
    // loginFailure: (state, action) => {
    //   state.error = action.payload;
    // },
    // You can add more reducers here for other actions if needed
  },
});

export const { loginSuccess, loginFailure } = userSlice.actions;

export default userSlice.reducer;

// Async action for logging in
export const loginUser = (username, password) => {
  return (dispatch) => {
    //console.log("API URL:", API);  // Add this line to check the value of API
    return axios
      .post(`${API}/login`, { username, password })
      .then((response) => {
        console.log("API Response Data:", response.data);
        if (response.data.access_token) {
          // Store the token in localStorage
          localStorage.setItem("Access_Token", response.data.access_token);
          dispatch(loginSuccess(response.data)); // Dispatch login success
          return response.data;
        } else {
          console.log("Authentication failed: No token received.");
          throw new Error("Authentication failed: No token received.");
        }
      })
      .catch((error) => {
        console.error("Login Error:", error);
        // Clear localStorage on login failure
        localStorage.removeItem("Access_Token");
        // dispatch(loginFailure(error.message)); // Dispatch login failure
        throw error; // Propagate error to handle in the component
      });
  };
};
