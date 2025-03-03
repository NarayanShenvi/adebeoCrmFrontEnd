// redux/slices/PerformaSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Import the Axios instance
import API from "../../config/config";  // Import the API URL

//Async action to fetch available performas with pagination and customer_id
export const fetchPerformasAsync = createAsyncThunk('performa/fetchPerformas', async ({ page, per_page, customer_id }) => {
  try {
    // Include the customer_id along with page and per_page as query parameters
    const response = await axios.get(`${API}/get_performas`, {
      params: { page, per_page, customer_id }, // Pass customer_id as a query param
    });
    
    return response.data; // Assuming the response contains performas, totalPages, etc.
  } catch (error) {
    // Handle any errors, including error response data if available
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});


// Define an async action for creating a proforma
export const createPerforma = createAsyncThunk('performa/createPerforma', async (performaData) => {
  try {
    const response = await axios.post(`${API}/create_performa`, performaData);
    return response.data; // Assuming the created proforma is returned
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});

const proformaSlice = createSlice({
  name: 'proformaInvoice',
  initialState: {
    performa: null,
    performas: [], // List of fetched performas
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPerformasAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPerformasAsync.fulfilled, (state, action) => {
      state.loading = false;
      const { performas, totalPages, currentPage } = action.payload;
      state.performas = performas;  // Ensuring the data is set here
      state.totalPages = totalPages;
      state.currentPage = currentPage;

    });
    builder.addCase(fetchPerformasAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  }
});

export default proformaSlice.reducer;
