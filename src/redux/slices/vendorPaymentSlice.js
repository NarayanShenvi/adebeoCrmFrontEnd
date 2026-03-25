import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// ==============================
// FETCH PURCHASE REPORT (USED FOR VENDOR PAYMENT)
// ==============================
export const fetchVendorPurchaseOrders = createAsyncThunk(
  'vendorPayment/fetchVendorPurchaseOrders',
  async (
    { page = 1, rows_per_page = 10, startDate, endDate, vendors },
    { rejectWithValue }
  ) => {
    const token = localStorage.getItem('Access_Token');

    if (!token) {
      return rejectWithValue("No access token found");
    }

    try {
      const response = await axios.get(`${API}/purchase_report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate,
          endDate,
          page,
          per_page: rows_per_page,
        },
      });

      return response.data;

    } catch (error) {
      if (error.response && error.response.status === 401) {
        return rejectWithValue("Token has expired or is invalid.");
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

  reducers: {
  resetVendorPayments: (state) => {
    state.recentOrders = [];
    state.loading = false;
    state.error = null;
    state.currentPage = 1;
    state.totalPages = 1;
  }
},

  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorPurchaseOrders.pending, (state) => {
      state.loading = true;     // ✅ ADD
      state.error = null;      // ✅ ADD (important)
      })

      .addCase(fetchVendorPurchaseOrders.fulfilled, (state, action) => {
      state.loading = false;

     state.recentOrders = (action.payload.purchases || []).map(order => ({
        _id: order._id,

        po_number: order["PO Number"],
        customer_name: order["Customer name"],
        product_name: order["Product"],
        vendor_name: order["Vendor Name"],
        total_amount: order["Total Amount (INR)"],
        status: order["Status"],
        purchase_date: order["Purchase Date"],

        qty: order["Qty"],
        purchase_price: order["Purchase Price (INR)"],
        tax_amount: order["Tax Amount (INR)"],

        pdf_link: order.pdf_link || null,
        base_url: order.base_url || ""
      }));
      
      
      state.currentPage = action.payload.currentPage || 1;
      state.totalPages = action.payload.totalPages || 1;
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

export const { resetVendorPayments } = vendorPaymentSlice.actions;
export default vendorPaymentSlice.reducer;
