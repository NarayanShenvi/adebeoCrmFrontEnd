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
      // Retrieve the token from localStorage
      const token = localStorage.getItem('Access_Token');
      
      // Make the GET request with Authorization header if token exists
      const response = await axios.get(`${API}/get_adebeo_orders?customer_ID=${customer_ID}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}, // Include Authorization header only if token exists
      });

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

// ✅ Fetch invoices by customer
export const fetchInvoicesByCustomer = createAsyncThunk(
  "information/fetchInvoicesByCustomer",
  async (customer_name) => {
    try {
      const token = localStorage.getItem("Access_Token");
      const response = await axios.get(`${API}/get_cxpayment`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { customer_name },
      });
      // response.data has { current_page, payments: [] }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
      );
    }
  }
);


// ✅ Disable invoice (with or without PO)
export const disableInvoice = createAsyncThunk(
  "information/disableInvoice",
  async ({ invoice_id, isEnableInvoicePurchase }) => {
    const token = localStorage.getItem("Access_Token");

    const response = await axios.put(
      `${API}/disable_invoice/${invoice_id}`,
      { isEnableInvoicePurchase }, // true = disable with PO, false = disable only invoice
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    return {
      invoice_id,
      isEnabled: false,
      isEnableInvoicePurchase,
    };
  }
);


const informationSlice = createSlice({
  name: 'information',
  initialState: {
    orders: {},           // Initialize orders as an empty object
    status: 'idle',           // Initial status
    loading: false,    // ✅ added       
    error: null,          // Store error messages here
    noOrdersFound: false, // New field to handle 'no orders found' 
     invoices: [],         // ✅ For customer invoices
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
      })
      // ✅ Fetch invoices by customer
      .addCase(fetchInvoicesByCustomer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInvoicesByCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoices = action.payload || [];
      })
      .addCase(fetchInvoicesByCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // ✅ Update invoice status
      .addCase(disableInvoice.fulfilled, (state, action) => {
  const { invoice_id, isEnabled } = action.payload;

  // If your state.invoices is just one object:
  if (state.invoices?.id === invoice_id) {
    state.invoices.isEnabled = isEnabled;
  }

  // If your state.invoices is just the ID:
  if (state.invoices === invoice_id) {
    state.invoices = { id: invoice_id, isEnabled }; 
  }
});


  },
});

export default informationSlice.reducer;
