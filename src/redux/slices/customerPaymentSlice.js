// src/redux/slices/customerPaymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";
import API from "../../config/config";

// fetchCustomerPaymentsAsync: unchanged
export const fetchCustomerPaymentsAsync = createAsyncThunk(
  'customerPayment/fetchCustomerPayments',
  async ({ page = 1, per_page = 10 }) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) throw new Error("No access token found. Please log in.");

    const response = await axios.get(`${API}/get_cxpayment`, {
      params: { page, per_page,include_disabled: true },
      headers: { Authorization: `Bearer ${token}` },
    });

    const { payments, total_count, total_pages, current_page } = response.data;
    const calculatedTotalPages = total_pages || Math.ceil((total_count || 0) / per_page);

    return {
      payments: payments || [],
      totalCount: total_count || 0,
      totalPages: calculatedTotalPages,
      currentPage: current_page || 1,
    };
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
  async (paymentData) => {
    const response = await axios.post(`${API}/process_payment`, paymentData);
    return response.data;
  }
);

export const recreateInvoiceAsync = createAsyncThunk(
  'customerPayment/recreateInvoice',
  async (invoice_id) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) throw new Error("No access token found. Please log in.");
    const response = await axios.post(`${API}/recreate_invoice/${invoice_id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

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
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pdfGenerating: false,
    pdfError: null,
    pdfFilePath: null,
    // NEW: keep client-created cancelled entries so server fetch won't drop them
    localCancelled: {}, // { [invoice_number]: paymentObj }
  },
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCustomerPaymentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerPaymentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An error occurred while fetching payments.";
      })
      .addCase(fetchCustomerPaymentsAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { payments, totalCount, totalPages, currentPage } = action.payload;
        state.payments = payments || [];
        state.totalCount = totalCount || 0;
        state.totalPages = totalPages || 1;
        state.currentPage = currentPage || 1;

        // --- MERGE any client-side cancelled entries that backend omitted ---
        // If backend didn't return a cancelled invoice, re-insert the localCancelled copy
        Object.keys(state.localCancelled).forEach(invNum => {
          const local = state.localCancelled[invNum];
          const exists = state.payments.some(p => p.invoice_number === invNum);
          if (!exists && local) {
            state.payments.unshift(local);
          } else if (exists && local) {
            // ensure server version reflects cancelled status too
            state.payments = state.payments.map(p =>
              p.invoice_number === invNum ? { ...p, ...local } : p
            );
          }
        });
      });

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
    builder
      .addCase(recreateInvoiceAsync.pending, (state) => { state.loading = true; })
      .addCase(recreateInvoiceAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPayment = action.payload;
        state.payments = state.payments.map(payment =>
          payment.invoice_number === updatedPayment.invoice_number ? { ...payment, ...updatedPayment } : payment
        );
        // recreate implies invoice is no longer cancelled — remove localCancelled if present
        if (updatedPayment.payment_status && updatedPayment.payment_status !== 'Cancelled') {
          delete state.localCancelled[updatedPayment.invoice_number];
        }
      })
      .addCase(recreateInvoiceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An error occurred while re-creating the invoice.";
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

export const { setPaymentStatus, upsertPayment } = customerPaymentSlice.actions;
export default customerPaymentSlice.reducer;
