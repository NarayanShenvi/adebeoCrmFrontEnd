import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Import the Axios instance
import API from "../../config/config";  // Import the API URL

// Async action to fetch customer payments with pagination
export const fetchCustomerPaymentsAsync = createAsyncThunk(
  'customerPayment/fetchCustomerPayments',
  async ({ page = 1, per_page = 10 }) => {  // Default pagination params
    // Retrieve the access token from localStorage
    const token = localStorage.getItem('Access_Token');  // Adjust if you use sessionStorage or another method

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    try {
      // Make the API call with the access token included in the headers
      const response = await axios.get(`${API}/get_cxpayment`, {
        params: { page, per_page },  // Passing pagination parameters
        headers: {
          Authorization: `Bearer ${token}`,  // Add the token to the request headers
        },
      });

      // Log the API response (for debugging)
      console.log('API Response:', response.data);

      const { payments, total_count, total_pages, current_page } = response.data;

      // If total_pages is missing, calculate it based on total_count and per_page
      const calculatedTotalPages = total_pages || Math.ceil(total_count / per_page);

      return {
        payments: payments || [],  // Ensure payments is an empty array if undefined
        totalCount: total_count || 0,  // Default to 0 if total_count is undefined
        totalPages: calculatedTotalPages,  // Default to calculated total_pages if undefined
        currentPage: current_page || 1,  // Default to 1 if current_page is undefined
      };
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(
        error.response ? error.response.data.message : error.message
      );
    }
  }
);

// export const fetchCustomerPaymentsAsync = createAsyncThunk(
//   'customerPayment/fetchCustomerPayments',
//   async ({ page = 1, per_page = 10 }) => {  // Default pagination params
//     try {
//       const response = await axios.get(`${API}/get_cxpayment`, {
//         params: { page, per_page },  // Passing pagination parameters
//       });

//       // Log the API response (for debugging)
//       console.log('API Response:', response.data);

//       const { payments, total_count, total_pages, current_page } = response.data;

//       // If total_pages is missing, calculate it based on total_count and per_page
//       const calculatedTotalPages = total_pages || Math.ceil(total_count / per_page);

//       return {
//         payments: payments || [],  // Ensure payments is an empty array if undefined
//         totalCount: total_count || 0,  // Default to 0 if total_count is undefined
//         totalPages: calculatedTotalPages,  // Default to calculated total_pages if undefined
//         currentPage: current_page || 1,  // Default to 1 if current_page is undefined
//       };
//     } catch (error) {
//       console.error("API Error:", error);
//       throw new Error(
//         error.response ? error.response.data.message : error.message
//       );
//     }
//   }
// );

// Async action to generate the invoice PDF
export const generateInvoicePdfAsync = createAsyncThunk(
  'customerPayment/generateInvoicePdf', 
  async (invoiceNumber) => {
    try {
      // Call the backend API to generate the invoice PDF
      const response = await axios.post(`${API}/generate_invoice_pdf/${invoiceNumber}`);
      return response.data;  // Assuming the response contains PDF generation success message or filename
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);

// Async action to process a payment
export const processCustomerPaymentAsync = createAsyncThunk(
  'customerPayment/processCustomerPayment', 
  async (paymentData) => {
    try {
      const response = await axios.post(`${API}/process_payment`, paymentData);
      return response.data;  // Assuming the response contains a success message or payment data
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);

const customerPaymentSlice = createSlice({
  name: 'customerPayment',
  initialState: {
    payments: [],  // List of fetched customer payments
    payment: null,  // Single payment data (if needed for processing or viewing a specific payment)
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,  // Added totalCount to track the total records in the backend
    pdfGenerating: false,  // New state to track if the PDF is being generated
    pdfError: null,  // New state to track if there's an error generating the PDF
    pdfFilePath: null,  // Store the generated PDF file path
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Payments Action
      .addCase(fetchCustomerPaymentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;  // Reset error before each fetch attempt
      })
      .addCase(fetchCustomerPaymentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An error occurred while fetching payments.";
      })
      .addCase(fetchCustomerPaymentsAsync.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Payment fetched successfully:", action.payload);
        const { payments, totalCount, totalPages, currentPage } = action.payload;
        state.payments = payments || [];
        state.totalCount = totalCount || 0;
        state.totalPages = totalPages || 1;
        state.currentPage = currentPage || 1;
      });

    // Process Payment Action
    builder
      .addCase(processCustomerPaymentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(processCustomerPaymentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPayment = action.payload;
        state.payments = state.payments.map(payment => 
          payment.invoice_number === updatedPayment.invoice_number 
            ? { 
                ...payment, 
                ...updatedPayment,  
                amount_due: payment.amount_due - updatedPayment.paid_amount,  
            }
            : payment
        );
      })
      .addCase(processCustomerPaymentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An error occurred while processing the payment.";
      });

    // Generate Invoice PDF Action
    builder
      .addCase(generateInvoicePdfAsync.pending, (state) => {
        state.pdfGenerating = true;  // Set loading state for PDF generation
        state.pdfError = null;  // Reset error
      })
      .addCase(generateInvoicePdfAsync.fulfilled, (state, action) => {
        state.pdfGenerating = false;  // Reset loading state
        console.log('PDF Generated successfully:', action.payload);
        state.pdfFilePath = action.payload.filePath;  // Assuming response contains filePath or filename
      })
      .addCase(generateInvoicePdfAsync.rejected, (state, action) => {
        state.pdfGenerating = false;  // Reset loading state
        state.pdfError = action.error.message || "An error occurred while generating the PDF.";  // Set error
      });
  },
});

export default customerPaymentSlice.reducer;
