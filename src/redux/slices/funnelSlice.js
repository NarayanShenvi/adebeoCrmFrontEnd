import { createSlice } from "@reduxjs/toolkit"; 
import axios from "../../config/apiConfig";  // Correct default import
import API from "../../config/config";  // Adjust the path if needed

const initialState = {
  funnelData: [],   // Initialize funnelData as an empty array
  loading: false,
  error: null,
};

// Create slice using createSlice for funnel
const funnelSlice = createSlice({
  name: "funnel", // Name of the slice
  initialState,
  reducers: {
    funnelCustomers: (state, action) => {
      state.funnelData = action.payload;  // Update funnelData
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { funnelCustomers, setLoading, setError } = funnelSlice.actions;
export default funnelSlice.reducer;

// To load the funnel data while loading the page
export const loadFunneldata = (page = 1, limit = 5, companyName = '') => {
  return async (dispatch) => {
    dispatch(setLoading(true)); // Set loading state
    try {
      console.log(`API: ${API}/funnel_users?page=${page}&limit=${limit}&companyName=${companyName}`);

      const response = await axios.get(`${API}/funnel_users`, {
        params: {
          page,
          limit,
          companyName,
        },
      });

      console.log("API Response:", response.data);

      // Dispatch only the 'data' part from the response
      if (response.data && response.data.data) {
        dispatch(funnelCustomers(response.data.data)); // Dispatch only the array of data
      } else {
        console.log("API response failed");
      }
    } catch (err) {
      console.log("API Error:", err);
      dispatch(setError(err.message || "Error loading funnel data"));
    } finally {
      dispatch(setLoading(false)); // Reset loading state
    }
  };
};
