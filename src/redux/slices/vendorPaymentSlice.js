import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// ==============================
// FETCH PURCHASE ORDERS (USED FOR VENDOR PAYMENT)
// ==============================
export const fetchVendorPurchaseOrders = createAsyncThunk(
  'vendorPayment/fetchVendorPurchaseOrders',
  async ({ page = 1, rows_per_page = 10, vendors = [] }, { rejectWithValue }) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) {
      throw new Error("No access token found");
    }

    try {
      let url = `${API}/get_purchase_orders?page=${page}&rows_per_page=${rows_per_page}`;

      // ✅ ADD THIS BLOCK
      if (vendors.length > 0) {
        url += `&vendor=${encodeURIComponent(vendors.join(","))}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error("Token has expired or is invalid.");
      }
  return rejectWithValue(
  error.response?.data?.message || error.message
);
    }
  }
);

// ==============================
// UPDATE VENDOR PAYMENT
// ==============================
export const updateVendorPayment = createAsyncThunk(
  "vendorPayment/updateVendorPayment",
  async (payload, { rejectWithValue }) => {
    const token = localStorage.getItem("Access_Token");

    if (!token) {
      return rejectWithValue("No access token found");
    }

    try {
      const response = await axios.post(
        `${API}/update_vendor_payment`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor payment"
      );
    }
  }
);

const vendorPaymentSlice = createSlice({
  name: 'vendorPayment',
  initialState: {
  recentOrders: [],
  loading: false,          // ✅ ADD
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0,
},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorPurchaseOrders.pending, (state) => {
      state.loading = true;     // ✅ ADD
      state.error = null;      // ✅ ADD (important)
      })

      .addCase(fetchVendorPurchaseOrders.fulfilled, (state, action) => {
      state.loading = false;

      state.recentOrders = (action.payload.orders || []).map(order => ({
        ...order,
        po_number: order.po_number || order.order_number
      }));

      state.currentPage = action.payload.page;
      state.totalPages = action.payload.total_pages;
      state.totalOrders = action.payload.total_orders;
    })

      .addCase(fetchVendorPurchaseOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
      })

      // ==============================
      // UPDATE VENDOR PAYMENT
      // ==============================

      .addCase(updateVendorPayment.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateVendorPayment.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(updateVendorPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vendorPaymentSlice.reducer;
