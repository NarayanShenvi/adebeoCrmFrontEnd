import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Import the Axios instance
import API from "../../config/config";  // Import the API URL

// Async action to fetch available performas with pagination and customer_id
export const fetchPerformasAsync = createAsyncThunk('performa/fetchPerformas', async ({ page, per_page, customer_id }) => {
  try {
    const response = await axios.get(`${API}/get_performas`, {
      params: { page, per_page, customer_id },
    });
    return response.data; // Assuming the response contains performas, totalPages, etc.
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});

// Async action for creating a proforma
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
    performa: null, // The newly created proforma
    performas: [],  // List of fetched performas
    loading: false, // General loading state
    error: null,    // Any errors during the fetch or create process
    currentPage: 1,
    totalPages: 1,
    successMessage: '', // Message to show on successful Proforma creation
  },
  reducers: {},
  extraReducers: (builder) => {
    // Handling fetchPerformasAsync actions
    builder.addCase(fetchPerformasAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPerformasAsync.fulfilled, (state, action) => {
      state.loading = false;
      const { performas, totalPages, currentPage } = action.payload;
      state.performas = performas; 
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    });
    builder.addCase(fetchPerformasAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Handling createPerforma actions
    builder.addCase(createPerforma.pending, (state) => {
      state.loading = true; // Show loading when creating proforma
    });
    builder.addCase(createPerforma.fulfilled, (state, action) => {
      state.loading = false;
      state.performa = action.payload; // Store the created proforma
      state.successMessage = `Proforma created successfully! PDF link: ${action.payload.pdf_link}`; // Show success message
    });
    builder.addCase(createPerforma.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message; // Capture any error that occurred
    });
  },
});

export default proformaSlice.reducer;
