// src/redux/slices/customerPaymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";
import API from "../../config/config";

// fetchCustomerPaymentsAsync: unchanged
// export const fetchCustomerPaymentsAsync = createAsyncThunk(
//   'customerPayment/fetchCustomerPayments',
//   async ({ page = 1, per_page = 10, search = "", searchType = "invoice" }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem('Access_Token');
//       if (!token) throw new Error("No access token found.");

//       const response = await axios.get(`${API}/get_cxpayment`, {
//         params: {
//           page,
//           per_page,
//           search, // ✅ invoice number
//           include_disabled: true,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const { payments, total_count, total_pages, current_page } = response.data;

//       return {
//         payments: payments || [],
//         totalCount: total_count || 0,
//         totalPages: total_pages || 1,
//         currentPage: current_page || 1,
//       };
//     } catch (err) {
//       // ✅ extract backend error from response
//       if (err.response && err.response.data) {
//         // the backend returns { error: "..." } instead of message
//         return rejectWithValue(err.response.data.message || err.response.data.error);
//       }
//       return rejectWithValue(err.message); // fallback
//     }
//   }
// ); ----this is older slice before adding new loader and error blocksin cx payment page----

export const fetchCustomerPaymentsAsync = createAsyncThunk(
  'customerPayment/fetchCustomerPayments',
  async (
    { page = 1, per_page = 10, search = "", searchType = "invoice" },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('Access_Token');
      if (!token) throw new Error("No access token found.");
      
      const params = {
        page,
        per_page,
        include_disabled: true,
      };

      if (search && search.trim() !== "") {
      const cleanedSearch = search.trim();

      if (searchType === "invoice") {
        params.invoice_number = cleanedSearch;
      }

      if (searchType === "customer") {
        params.customer_name = cleanedSearch;
      }
    }

    console.log("Request Params:", params);
    
      const response = await axios.get(`${API}/get_cxpayment`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const { payments, total_count, total_pages, current_page } = response.data;

      return {
        payments: payments || [],
        totalCount: total_count || 0,
        totalPages: total_pages || 1,
        currentPage: current_page || 1,
      };
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || err.response.data.error
        );
      }
      return rejectWithValue(err.message);
    }
  }
);


// generateInvoicePdfAsync, processCustomerPaymentAsync, recreateInvoiceAsync, disableInvoiceAsync:
export const generateInvoicePdfAsync = createAsyncThunk(
  'customerPayment/generateInvoicePdf',
  async (invoiceNumber) => {
    const response = await axios.post(`${API}/generate_invoice_pdf/${invoiceNumber}`);
    return response.data;
  }
);

export const processCustomerPaymentAsync = createAsyncThunk(
  'customerPayment/processCustomerPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/process_payment`, paymentData);
      return response.data;
    } catch (err) {
      // ✅ Extract backend error safely
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Payment processing failed"
        );
      }
      return rejectWithValue(err.message || "Payment processing failed");
    }
  }
);


export const recreateInvoiceAsync = createAsyncThunk(
  'customerPayment/recreateInvoice',
  async (invoice_id, thunkAPI) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) throw new Error("No access token found. Please log in.");

    // Step 1: Call backend to regenerate invoice
    const response = await axios.post(`${API}/recreate_invoice/${invoice_id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newInvoice = response.data;

    // Step 2: Dispatch a full refetch of customer payments
    await thunkAPI.dispatch(fetchCustomerPaymentsAsync({ page: 1, per_page: 10 }));

    // Step 3: Return new invoice for use in reducer if needed
    return newInvoice;
  }
);

// export const recreateInvoiceAsync = createAsyncThunk(
//   'customerPayment/recreateInvoice',
//   async (invoice_id) => {
//     const token = localStorage.getItem('Access_Token');
//     if (!token) throw new Error("No access token found. Please log in.");
//     const response = await axios.post(`${API}/recreate_invoice/${invoice_id}`, {}, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   }
// );

export const disableInvoiceAsync = createAsyncThunk(
  "customerPayment/disableInvoice",
  async (invoiceNumber) => {
    const token = localStorage.getItem("Access_Token");
    if (!token) throw new Error("No access token found. Please log in.");
    const response = await axios.post(`${API}/disable_invoice/${invoiceNumber}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const customerPaymentSlice = createSlice({
  name: 'customerPayment',
  initialState: {
    payments: [],
    payment: null,
    loading: false,          // only for big loading (e.g., full table reload)
    pageLoading: false,      // for pagination/search
    firstLoad: true, 
    error: null,
    currentPage: 1,
    totalPages: 1,
    searchTerm: "",
    totalCount: 0,
    pdfGenerating: false,
    pdfError: null,
    pdfFilePath: null,
    // NEW: keep client-created cancelled entries so server fetch won't drop them
    localCancelled: {}, // { [invoice_number]: paymentObj }
    hasFetchedOnce: false, //added
    isInitialLoading: true,
  },
  reducers: {

  //----this is added after  adding new loader and error blocksin cx payment page-----
  resetCustomerPayments: (state) => {
    state.payments = [];
    state.pageLoading = false;
    state.loading = false;
    state.error = null;
    state.currentPage = 1;
    state.totalPages = 1;
    state.totalCount = 0;
    state.hasFetchedOnce = false; 
    state.isInitialLoading = true;
  },


    // update status locally
    setPaymentStatus: (state, action) => {
      const { invoice_number, payment_status } = action.payload;
      const idx = state.payments.findIndex(p => p.invoice_number === invoice_number);
      if (idx >= 0) {
        state.payments[idx].payment_status = payment_status;
      }
      // keep a localCancelled copy if it's cancelled (so fetch won't drop it)
      if (payment_status === 'Cancelled') {
        const existing = state.payments[idx] || {};
        state.localCancelled[invoice_number] = { ...existing, invoice_number, payment_status };
      } else {
        // if it's not cancelled, remove any localCancelled placeholder
        delete state.localCancelled[invoice_number];
      }
    },

    // upsert a payment object; also store in localCancelled if cancelled
    upsertPayment(state, action) {
      const updated = action.payload;
      const invoiceNum = updated.invoice_number;
      const idx = state.payments.findIndex(p => p.invoice_number === invoiceNum);
      if (idx >= 0) {
        state.payments[idx] = { ...state.payments[idx], ...updated };
      } else {
        // put newly created/inserted items at front
        state.payments.unshift(updated);
      }
      if (updated.payment_status === 'Cancelled') {
        state.localCancelled[invoiceNum] = { ...updated };
      } else {
        delete state.localCancelled[invoiceNum];
      }
    },

    setSearchTerm: (state, action) => {
    state.searchTerm = action.payload;
    },
  },

extraReducers: (builder) => {
    builder
      // fetch
// .addCase(fetchCustomerPaymentsAsync.pending, (state) => {
//   if (state.firstLoad) {
//     state.pageLoading = true; // show loading spinner only for first table load
//   }
//   state.error = null;
// })    ----this is older slice before adding new loader and error blocksin cx payment page----

.addCase(fetchCustomerPaymentsAsync.pending, (state) => {
  state.pageLoading = true;
  state.error = null;
})

// .addCase(fetchCustomerPaymentsAsync.fulfilled, (state, action) => {
//   state.pageLoading = false;
//   state.firstLoad = false; // mark first load done
  
//   const { payments, totalCount, totalPages, currentPage } = action.payload;
//   state.payments = payments || [];
//   state.totalCount = totalCount || 0;
//   state.totalPages = totalPages || 1;
//   state.currentPage = currentPage || 1;

//   Object.keys(state.localCancelled).forEach(invNum => {
//     const local = state.localCancelled[invNum];
//     const exists = state.payments.some(p => p.invoice_number === invNum);
//     if (!exists && local) {
//       state.payments.unshift(local);
//     }
//   });
// })  ----this is older slice before adding new loader and error blocksin cx payment page----

.addCase(fetchCustomerPaymentsAsync.fulfilled, (state, action) => {
  state.pageLoading = false;
  state.firstLoad = false;
  state.hasFetchedOnce = true;
  state.isInitialLoading = false;

  const { payments, totalCount, totalPages, currentPage } = action.payload;
  state.payments = payments || [];
  state.totalCount = totalCount || 0;
  state.totalPages = totalPages || 1;
  state.currentPage = currentPage || 1;
})

// .addCase(fetchCustomerPaymentsAsync.rejected, (state, action) => {
//   state.pageLoading = false;
//   state.firstLoad = false;
//   state.error = action.payload || "An error occurred while fetching payments.";
//   state.error = action.error?.message || "An error occurred while fetching payments.";
// }); ----this is older slice before adding new loader and error blocksin cx payment page----

.addCase(fetchCustomerPaymentsAsync.rejected, (state, action) => {
  state.pageLoading = false;
  state.firstLoad = false;
  state.hasFetchedOnce = true;
  state.isInitialLoading = false;
  state.error =
    action.payload ||
    action.error?.message ||
    "An error occurred while fetching payments.";
});

      // .addCase(fetchCustomerPaymentsAsync.fulfilled, (state, action) => {
      //   state.loading = false;
      //   const { payments, totalCount, totalPages, currentPage } = action.payload;
      //   state.payments = payments || [];
      //   state.totalCount = totalCount || 0;
      //   state.totalPages = totalPages || 1;
      //   state.currentPage = currentPage || 1;

      //   // --- MERGE any client-side cancelled entries that backend omitted ---
      //   // If backend didn't return a cancelled invoice, re-insert the localCancelled copy
      //   Object.keys(state.localCancelled).forEach(invNum => {
      //     const local = state.localCancelled[invNum];
      //     const exists = state.payments.some(p => p.invoice_number === invNum);
      //     if (!exists && local) {
      //       state.payments.unshift(local);
      //     } else if (exists && local) {
      //       // ensure server version reflects cancelled status too
      //       state.payments = state.payments.map(p =>
      //         p.invoice_number === invNum ? { ...p, ...local } : p
      //       );
      //     }
      //   });
      // });

    // process payment
    builder
      .addCase(processCustomerPaymentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(processCustomerPaymentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPayment = action.payload;
        state.payments = state.payments.map(payment =>
          payment.invoice_number === updatedPayment.invoice_number
            ? { ...payment, ...updatedPayment, amount_due: payment.amount_due - (updatedPayment.paid_amount || 0) }
            : payment
        );
      })
      .addCase(processCustomerPaymentAsync.rejected, (state, action) => {
        state.loading = false;
         state.error = action.payload || "An error occurred while processing the payment.";
        state.error = action.error?.message || "An error occurred while processing the payment.";
      });

    // pdf generation states
    builder
      .addCase(generateInvoicePdfAsync.pending, (state) => {
        state.pdfGenerating = true;
        state.pdfError = null;
      })
      .addCase(generateInvoicePdfAsync.fulfilled, (state, action) => {
        state.pdfGenerating = false;
        state.pdfFilePath = action.payload?.filePath || null;
      })
      .addCase(generateInvoicePdfAsync.rejected, (state, action) => {
        state.pdfGenerating = false;
        state.pdfError = action.error?.message || "An error occurred while generating the PDF.";
      });

    // recreate
//     builder
//       .addCase(recreateInvoiceAsync.pending, (state) => { state.loading = true; })
//       .addCase(recreateInvoiceAsync.fulfilled, (state, action) => {
//   state.loading = false;
//   const newInvoice = action.payload; // the newly created invoice from backend
//   const oldInvoiceId = newInvoice.old_invoice_id; // backend should return this, else pass it from frontend

//   // Step 1: Add new invoice to the list (insert at front)
//   state.payments.unshift(newInvoice);

//   // Step 2: Find old invoice and mark it as 'Regenerated' and disable regeneration
//   const oldIndex = state.payments.findIndex(p => p.invoice_id === oldInvoiceId);
//   if (oldIndex >= 0) {
//     state.payments[oldIndex].payment_status = "Regenerated";
//     state.payments[oldIndex].canRegenerate = false;
//   }

//   // Step 3: Remove from localCancelled if present
//   if (oldInvoiceId && state.localCancelled[oldInvoiceId]) {
//     delete state.localCancelled[oldInvoiceId];
//   }
// });

builder
  .addCase(recreateInvoiceAsync.pending, (state) => {
    state.loading = true;
  })
  .addCase(recreateInvoiceAsync.fulfilled, (state) => {
    state.loading = false;
    // No need to manually modify state — the full list has already been refetched
  })
  .addCase(recreateInvoiceAsync.rejected, (state) => {
    state.loading = false;
  });


    // disable (when called from payments slice)
    builder
      .addCase(disableInvoiceAsync.pending, (state) => { state.loading = true; })
      .addCase(disableInvoiceAsync.fulfilled, (state, action) => {
        state.loading = false;
        const disabledInvoice = action.payload;
        state.payments = state.payments.map((payment) =>
          payment.invoice_number === disabledInvoice.invoice_number
            ? { ...payment, ...disabledInvoice, payment_status: "Cancelled" }
            : payment
        );
        // ensure it's in localCancelled so future fetches don't drop it
        if (disabledInvoice && disabledInvoice.invoice_number) {
          state.localCancelled[disabledInvoice.invoice_number] = {
            ...disabledInvoice, payment_status: "Cancelled"
          };
        }
      })
      .addCase(disableInvoiceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An error occurred while disabling the invoice.";
      });
  },
});

export const { setPaymentStatus, upsertPayment, setSearchTerm } = customerPaymentSlice.actions;
export default customerPaymentSlice.reducer;
export const { resetCustomerPayments } = customerPaymentSlice.actions;
