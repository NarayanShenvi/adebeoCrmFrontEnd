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
          reportType,
          endDate,  
          user,
          page,
          per_page: perPage,
        };

        // Only add companyName if it's not an empty string
        if (companyName && companyName.trim() !== "") {
  // Instead of params.company_name
  params.companyName = companyName; 
        }
  console.log("Final API Request:", `${API}/activity_report`, params);

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

  // ------------------------------
  // SALES REPORT 
  // ------------------------------

  export const fetchSalesReport = createAsyncThunk(
    "report/fetchSalesReport",
    async ({ startDate, endDate, page, perPage }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("Access_Token"); // read token from localStorage

        const params = {
          startDate,
          endDate,
          page,
          per_page: perPage,
        };

        console.log("Fetching SALES report with params:", params);
        console.log("Access Token:", token);

        const response = await axios.get(`${API}/sales_report`, {
          headers: {
            Authorization: `Bearer ${token}`, // pass token directly
          },
          params,
        });

        return response.data;
      } catch (error) {
        console.error("Error fetching sales report:", error);
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch sales report"
        );
      }
    }
  );

// ------------------------------
// PURCHASE REPORT
// ------------------------------
export const fetchPurchaseReport = createAsyncThunk(
  "report/fetchPurchaseReport",
  async ({ startDate, endDate, page, perPage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Access_Token");

      const params = {
        startDate,
        endDate,
        page,
        per_page: perPage,
      };

      console.log("Fetching PURCHASE report with params:", params);

      const response = await axios.get(`${API}/purchase_report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching purchase report:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase report"
      );
    }
  }
);

// ------------------------------
// BUSINESS REPORT
// ------------------------------
export const fetchBusinessReport = createAsyncThunk(
  "report/fetchBusinessReport",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Access_Token");

      const params = {
        startDate,
        endDate,
      };

      console.log("Fetching BUSINESS report with params:", params);

      const response = await axios.get(`${API}/business_report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching business report:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch business report"
      );
    }
  }
);

// ------------------------------
// PAYMENT REPORT
// ------------------------------
export const fetchPaymentReport = createAsyncThunk(
  "report/fetchPaymentReport",
  async ({ startDate, endDate, page, perPage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Access_Token");

      const params = {
        startDate,
        endDate,
        page,
        per_page: perPage,
      };

      console.log("Fetching PAYMENT report with params:", params);

      const response = await axios.get(`${API}/payment_report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching payment report:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment report"
      );
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

      // ---- SALES REPORT STATE ----
    salesReports: [],
    salesLoading: false,
    salesError: null,
    salesCurrentPage: 1,
    salesTotalPages: 1,
    
    // ---- PURCHASE REPORT STATE ----
    purchaseReports: [],
    purchaseLoading: false,
    purchaseError: null,
    purchaseCurrentPage: 1,
    purchaseTotalPages: 1,

    // ---- BUSINESS REPORT STATE ----
    businessReports: [],
    businessLoading: false,
    businessError: null,

    // ---- PAYMENT REPORT STATE ----
    paymentReports: [],
    paymentLoading: false,
    paymentError: null,
    paymentCurrentPage: 1,
    paymentTotalPages: 1,

  },

reducers: {
  resetSalesReport: (state) => {
    state.salesReports = [];
    state.salesLoading = false;
    state.salesError = null;
    state.salesCurrentPage = 1;
    state.salesTotalPages = 1;
  },

  resetPurchaseReport: (state) => {
      state.purchaseReports = [];
      state.purchaseLoading = false;
      state.purchaseError = null;
      state.purchaseCurrentPage = 1;
      state.purchaseTotalPages = 1;
  },

  resetBusinessReport: (state) => {
      state.businessReports = [];
      state.businessLoading = false;
      state.businessError = null;
  },

  resetPaymentReport: (state) => {
      state.paymentReports = [];
      state.paymentLoading = false;
      state.paymentError = null;
      state.paymentCurrentPage = 1;
      state.paymentTotalPages = 1;
  },

},

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
        })
      
  // ------------------------------
  // SALES REPORT REDUCERS
  // ------------------------------
  .addCase(fetchSalesReport.pending, (state) => {
    console.log("Fetching SALES report - Pending...");
    state.salesLoading = true;
    state.salesError = null;
  })
  .addCase(fetchSalesReport.fulfilled, (state, action) => {
    console.log("Fetching SALES report - Fulfilled", action.payload);

    state.salesLoading = false;

    // API structure:
    // {
    //   currentPage: 1,
    //   sales: [ {...}, {...} ]
    // }

    state.salesReports = action.payload.sales || [];
    state.salesCurrentPage = action.payload.currentPage || 1;

    // If backend later sends totalPages, this will auto-work
    state.salesTotalPages = action.payload.totalPages || 1;
  })
  .addCase(fetchSalesReport.rejected, (state, action) => {
    console.log("Fetching SALES report - Rejected", action.error.message);
    state.salesLoading = false;
    state.salesError = action.error.message || "Unknown error";
  })

  // ------------------------------
    // PURCHASE REPORT REDUCERS
    // ------------------------------
      .addCase(fetchPurchaseReport.pending, (state) => {
        console.log("Fetching PURCHASE report - Pending...");
        state.purchaseLoading = true;
        state.purchaseError = null;
      })
      .addCase(fetchPurchaseReport.fulfilled, (state, action) => {
        console.log("Fetching PURCHASE report - Fulfilled", action.payload);
        state.purchaseLoading = false;
        state.purchaseReports = action.payload.purchases || [];
        state.purchaseCurrentPage = action.payload.currentPage || 1;
        state.purchaseTotalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchPurchaseReport.rejected, (state, action) => {
        console.log("Fetching PURCHASE report - Rejected", action.error.message);
        state.purchaseLoading = false;
        state.purchaseError = action.error.message || "Unknown error";
      })

      // ------------------------------
// BUSINESS REPORT REDUCERS
// ------------------------------
.addCase(fetchBusinessReport.pending, (state) => {
  console.log("Fetching BUSINESS report - Pending...");
  state.businessLoading = true;
  state.businessError = null;
})
.addCase(fetchBusinessReport.fulfilled, (state, action) => {
  console.log("Fetching BUSINESS report - Fulfilled", action.payload);
  state.businessLoading = false;

  // ✅ FIXED: match backend response key
  state.businessReports = action.payload.businessReport || [];

  state.businessTotalCount = action.payload.totalCount || 0;
})

.addCase(fetchBusinessReport.rejected, (state, action) => {
  console.log("Fetching BUSINESS report - Rejected", action.error.message);
  state.businessLoading = false;
  state.businessError = action.error.message || "Unknown error";
})

// ------------------------------
// PAYMENT REPORT REDUCERS
// ------------------------------
.addCase(fetchPaymentReport.pending, (state) => {
  console.log("Fetching PAYMENT report - Pending...");
  state.paymentLoading = true;
  state.paymentError = null;
})

.addCase(fetchPaymentReport.fulfilled, (state, action) => {
  console.log("Fetching PAYMENT report - Fulfilled", action.payload);

  state.paymentLoading = false;

  // API structure:
  // {
  //   currentPage: 1,
  //   payment_report: [ {...} ]
  // }

  state.paymentReports = action.payload.payment_report || [];
  state.paymentCurrentPage = action.payload.currentPage || 1;
  state.paymentTotalPages = action.payload.totalPages || 1;
})

.addCase(fetchPaymentReport.rejected, (state, action) => {
  console.log("Fetching PAYMENT report - Rejected", action.error.message);
  state.paymentLoading = false;
  state.paymentError = action.error.message || "Unknown error";
});

    },
  });

  
export const { resetSalesReport, resetPurchaseReport,  resetBusinessReport, resetPaymentReport } = reportSlice.actions;

export default reportSlice.reducer;
