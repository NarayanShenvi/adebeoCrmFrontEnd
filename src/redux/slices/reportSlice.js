import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  
import API from "../../config/config";  

// Async action to fetch the activity report
export const fetchActivityReport = createAsyncThunk(
  'report/fetchActivityReport',
  async ({ startDate, endDate, companyName, reportType, user, page, perPage, accessToken }) => {
    try {
      // Create the query parameters object, ensuring that companyName is excluded if it's an empty string
      const params = {
        startDate,
        endDate,
        user,
        page,
        per_page: perPage,
      };

      // Only add companyName if it's not an empty string
      if (companyName && companyName.trim() !== "") {
        params.companyName = companyName;
      }

      // Log the parameters being sent to the API for debugging
      console.log("Fetching activity report with parameters:", params);

      // Make the API request with headers for authorization and formatted query params
      const response = await axios.get(`${API}/activity_report`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // Include the access token in the header
        },
        params,  // Send the query parameters as part of the request
      });

      // Log the API response for debugging
      console.log("Activity report response:", response.data);

      // Return the fetched data
      return response.data;
    } catch (error) {
      // Log the error message if something goes wrong
      console.error("Error fetching activity report:", error);
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    activities: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 10,  // Default per page value
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityReport.pending, (state) => {
        // Log when the request is in progress
        console.log("Fetching report - Pending...");
        state.loading = true;
        state.error = null;  // Reset previous errors
      })
      .addCase(fetchActivityReport.fulfilled, (state, action) => {
        // Log when the request is fulfilled (success)
        console.log("Fetching report - Fulfilled", action.payload);
        
        state.loading = false;
        
        // Ensure we safely handle the response payload
        state.activities = action.payload.activities || [];  // Default to empty array if missing
        state.totalPages = action.payload.totalPages || 1;  // Default to 1 if undefined
        state.totalCount = action.payload.totalCount || 0;  // Default to 0 if undefined
        state.currentPage = action.payload.currentPage || 1;  // Default to 1 if undefined
      })
      .addCase(fetchActivityReport.rejected, (state, action) => {
        // Log when the request fails (error)
        console.log("Fetching report - Rejected", action.error.message);
        state.loading = false;
        state.error = action.error.message || "Unknown error";  // Use a fallback message if no error message
      });
  },
});

export default reportSlice.reducer;
