import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';  // Axios instance
import API from '../../config/config';       // API URL constants

// Async thunk to fetch proformas
export const fetchProformas = createAsyncThunk(
  'purchaseOrder/fetchProformas',
  async () => {
    // Retrieve the access token from localStorage
    const token = localStorage.getItem('Access_Token');  // Adjust if you use sessionStorage or another method
    
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    try {
      // Make the API call with the access token included in the headers
      const response = await axios.get(
        `${API}/get_proformas_for_purchase_order`,
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Add the token to the request headers
          },
        }
      );
      return response.data;  // Return the response data (proformas)
    } catch (error) {
      // Handle errors (e.g., token expired, invalid token, etc.)
      if (error.response && error.response.status === 401) {
        throw new Error("Token has expired or is invalid.");
      }
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);
// export const fetchProformas = createAsyncThunk(
//   'purchaseOrder/fetchProformas',
//   async () => {
//     const response = await axios.get(`${API}/get_proformas_for_purchase_order`);
//     return response.data;
//   }
// );

// Async thunk to fetch paginated purchase orders
// export const fetchPurchaseOrders = createAsyncThunk(
//   'purchaseOrder/fetchPurchaseOrders',
//   async ({ page = 1, rows_per_page = 10 }) => {
//     const response = await axios.get(
//       `${API}/get_purchase_orders?page=${page}&rows_per_page=${rows_per_page}`
//     );
//     return response.data;
//   }
// );

// Async thunk to fetch paginated purchase orders
export const fetchPurchaseOrders = createAsyncThunk(
  'purchaseOrder/fetchPurchaseOrders',
  async ({ page = 1, rows_per_page = 10 }) => {
    // Retrieve the access token from localStorage (or wherever you store it)
    const token = localStorage.getItem('Access_Token');  // Adjust if you use sessionStorage or another method
    
    if (!token) {
      throw new Error("No access token found");
    }

    try {
      const response = await axios.get(
        `${API}/get_purchase_orders?page=${page}&rows_per_page=${rows_per_page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Add the token to the headers
          },
        }
      );
      return response.data;  // Return the response data (purchase orders)
    } catch (error) {
      // Handle the error if token is expired or any other issue
      if (error.response && error.response.status === 401) {
        throw new Error("Token has expired or is invalid.");
      }
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);

// Async thunk to create a new purchase order
export const createPurchaseOrder = createAsyncThunk(
  'purchaseOrder/createPurchaseOrder',
  async ({ proforma_id, itemsWithDiscount }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/create_purchase_orders`, {
        proforma_id,
        items: itemsWithDiscount,
      });
      return response.data;  // Assuming response contains the data after the order is created
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState: {
    proformas: [],
    recentOrders: [],
    status: 'idle',
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    isProformasFetched: false,
    orderStatus: null, // To store the status of order creation (success or failure)
  },
  reducers: {
    setProformasFetched: (state) => {
      state.isProformasFetched = true;
    },
    resetProformasFetched: (state) => {
      state.isProformasFetched = false;
    },
    setRecentOrders: (state, action) => {
      state.recentOrders = action.payload.orders;
      state.totalOrders = action.payload.total_orders;
      state.totalPages = action.payload.total_pages;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProformas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProformas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proformas = action.payload;
        state.isProformasFetched = true;
      })
      .addCase(fetchProformas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload.orders;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.total_pages;
        state.totalOrders = action.payload.total_orders;
      });
      builder.addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Handle createPurchaseOrder API call success
      .addCase(createPurchaseOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderStatus = 'success';  // Store the success status in the state
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.orderStatus = 'failed';  // Store the failure status in the state
        state.error = action.payload; // Store error message
      });
  },
});

export const { setProformasFetched, resetProformasFetched, setRecentOrders } = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;

