// informationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';  // Axios instance
import API from '../../config/config';       // API URL constants

// Async thunk to fetch customer orders
export const fetchAdebeoOrders = createAsyncThunk(
  'information/fetchAdebeoOrders',
  async ({ customer_ID }) => {
    const response = await axios.get(`${API}/get_adebeo_orders?customer_ID=${customer_ID}`);
    return response.data;  // The orders returned from the backend
  }
);

const informationSlice = createSlice({
  name: 'information',
  initialState: {
    orders: {}, // Initialize orders as an empty object
    status: 'idle', // Initial status
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdebeoOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdebeoOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload; // Save the fetched orders in the state
      })
      .addCase(fetchAdebeoOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default informationSlice.reducer;
