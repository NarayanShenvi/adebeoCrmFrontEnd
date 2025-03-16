// // informationSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../../config/apiConfig';  // Axios instance
// import API from '../../config/config';       // API URL constants

// // Async thunk to fetch customer orders here
// export const fetchAdebeoOrders = createAsyncThunk(
//   'information/fetchAdebeoOrders',
//   async ({ customer_ID }) => {
//     const response = await axios.get(`${API}/get_adebeo_orders?customer_ID=${customer_ID}`);
//     return response.data;  // The orders returned from the backend
//   }
// );

// const informationSlice = createSlice({
//   name: 'information',
//   initialState: {
//     orders: {}, // Initialize orders as an empty object
//     status: 'idle', // Initial status
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAdebeoOrders.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchAdebeoOrders.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.orders = action.payload; // Save the fetched orders in the state
//       })
//       .addCase(fetchAdebeoOrders.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message;
//       });
//   },
// });

// export default informationSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';  // Axios instance
import API from '../../config/config';       // API URL constants

// Async thunk to fetch customer orders
export const fetchAdebeoOrders = createAsyncThunk(
  'information/fetchAdebeoOrders',
  async ({ customer_ID }) => {
    try {
      const response = await axios.get(`${API}/get_adebeo_orders?customer_ID=${customer_ID}`);
      
      // Check if the response is empty or if no orders are found for the customer
      if (response.status === 404 || response.data.message === "No orders found for this customer") {
        throw new Error("No orders found for this customer");
      }
      
      return response.data;  // Return the orders if found
    } catch (error) {
      // Handle error here and propagate the message
      throw error;
    }
  }
);

const informationSlice = createSlice({
  name: 'information',
  initialState: {
    orders: {},           // Initialize orders as an empty object
    status: 'idle',       // Initial status
    error: null,          // Store error messages here
    noOrdersFound: false, // New field to handle 'no orders found' state
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdebeoOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.noOrdersFound = false;
      })
      .addCase(fetchAdebeoOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;  // Save the fetched orders in the state
        state.noOrdersFound = false;    // Reset this flag if orders are found
      })
      .addCase(fetchAdebeoOrders.rejected, (state, action) => {
        state.status = 'failed';
        if (action.error.message === "No orders found for this customer") {
          state.error = "No orders found for this customer";  // Custom error message
          state.noOrdersFound = true;  // Set the flag to true if no orders found
        } else {
          state.error = action.error.message;  // Any other errors
        }
      });
  },
});

export default informationSlice.reducer;
