// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from "../../config/apiConfig";  // Import the Axios instance
// import API from "../../config/config";  // Import the API URL

// // Define an async action for creating a quote
// export const createQuote = createAsyncThunk('quote/createQuote', async (quoteData) => {
//   try {
//     const response = await axios.post(`${API}/adebeo_create_quotes`, quoteData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response ? error.response.data.message : error.message);
//   }
// });

// // Define an async action for fetching quotes with pagination
// export const fetchQuotesAsync = createAsyncThunk('quote/fetchQuotes', async ({ page, per_page }) => {
//   try {
//     const response = await axios.get(`${API}/adebeo_get_quotes`, {
//       params: {
//         page: page,
//         per_page: per_page,
//       },
//     });
//     return response.data;  // Assuming the response has a structure like { quotes, totalPages }
//   } catch (error) {
//     throw new Error(error.response ? error.response.data.message : error.message);
//   }
// });

// const quoteSlice = createSlice({
//   name: 'quote',
//   initialState: {
//     quote: null,
//     quotes: [], // List of fetched quotes
//     loading: false,
//     error: null,
//     currentPage: 1,
//     totalPages: 1, // Total pages for pagination
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     // Handle the createQuote async actions
//     builder
//       .addCase(createQuote.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createQuote.fulfilled, (state, action) => {
//         state.loading = false;
//         state.quote = action.payload; // Store the created quote data
//       })
//       .addCase(createQuote.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message; // Store any errors that occur
//       })
      
//       // Handle the fetchQuotes async actions
//       .addCase(fetchQuotesAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchQuotesAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         const { quotes, totalPages, currentPage } = action.payload;
//         state.quotes = quotes; // Update quotes list
//         state.totalPages = totalPages; // Update total pages
//         state.currentPage = currentPage; // Update current page
//       })
//       .addCase(fetchQuotesAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message; // Store any errors that occur
//       });
//   },
// });

// export default quoteSlice.reducer;


// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from "../../config/apiConfig";  // Import the Axios instance
// import API from "../../config/config";  // Import the API URL

// // Async action to fetch available quotes with pagination and customer_id
// export const fetchQuotesAsync = createAsyncThunk('quote/fetchQuotes', async ({ page, per_page, customer_id }) => {
//   try {
//     // Include the customer_id along with page and per_page as query parameters
//     const response = await axios.get(`${API}/get_quotes`, {
//       params: { page, per_page, customer_id }, // Pass customer_id as a query param
//     });
    
//     return response.data; // Assuming the response contains quotes, totalPages, etc.
//   } catch (error) {
//     // Handle any errors, including error response data if available
//     throw new Error(error.response ? error.response.data.message : error.message);
//   }
// });


// // Define an async action for creating a quote
// export const createQuote = createAsyncThunk('quote/createQuote', async (quoteData) => {
//   try {
//     const response = await axios.post(`${API}/adebeo_create_quotes`, quoteData);
//     return response.data; // Assuming the created quote is returned
//   } catch (error) {
//     throw new Error(error.response ? error.response.data.message : error.message);
//   }
// });

// const quoteSlice = createSlice({
//   name: 'quote',
//   initialState: {
//     quote: null,
//     quotes: [], // List of fetched quotes
//     loading: false,
//     error: null,
//     currentPage: 1,
//     totalPages: 1,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     // Handle fetchQuotesAsync actions
//     builder
//       .addCase(fetchQuotesAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchQuotesAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         const { quotes, totalPages, currentPage } = action.payload;
//         state.quotes = quotes;
//         state.totalPages = totalPages;
//         state.currentPage = currentPage;
//       })
//       .addCase(fetchQuotesAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       })

//       // Handle createQuote actions
//       .addCase(createQuote.fulfilled, (state, action) => {
//         state.quotes.push(action.payload); // Add the newly created quote to the list
//       })
//       .addCase(createQuote.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       });
//   },
// });

// export default quoteSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Import the Axios instance
import API from "../../config/config";  // Import the API URL

// Async action to fetch available quotes with pagination and customer_id
// export const fetchQuotesAsync = createAsyncThunk('quote/fetchQuotes', async ({ page, per_page, customer_id }) => {
//   try {
//     // Include the customer_id along with page and per_page as query parameters
//     const response = await axios.get(`${API}/get_quotes`, {
//       params: { page, per_page, customer_id }, // Pass customer_id as a query param
//     });
    
//     return response.data; // Assuming the response contains quotes, totalPages, etc.
//   } catch (error) {
//     // Handle any errors, including error response data if available
//     throw new Error(error.response ? error.response.data.message : error.message);
//   }
// });

export const fetchQuotesAsync = createAsyncThunk('quote/fetchQuotes', async ({ page, per_page, customer_id }) => {
  try {
    const token = localStorage.getItem('Access_Token');  // Retrieve token (if needed)
    
    // If token is needed in the request headers, include it like this:
    const response = await axios.get(`${API}/get_quotes`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}, // Include header only if token exists
      params: { page, per_page, customer_id },
    });
    
    return response.data; // Assuming the response contains quotes, totalPages, etc.
  } catch (error) {
    // Handle any errors, including error response data if available
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});

// Define an async action for creating a quote
export const createQuote = createAsyncThunk('quote/createQuote', async (quoteData) => {
  try {
    const response = await axios.post(`${API}/adebeo_create_quotes`, quoteData);
    return response.data; // Assuming the created quote is returned
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});

const quoteSlice = createSlice({
  name: 'quote',
  initialState: {
    quote: null,
    quotes: [], // List of fetched quotes
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    successMessage: '',  // Store the success message
    quoteId: '',  // Store the quote ID
    pdfLink: '',  // Store the PDF link
    quoteCreationResponse: null,  // Store the response message and PDF link
  },
  reducers: {
    // Optional: Reset success message after some time
    resetSuccessMessage: (state) => {
      state.successMessage = '';  // Reset the success message
      state.quoteId = '';         // Reset the quote ID
      state.pdfLink = '';         // Reset the PDF link
    },
    clearSuccessMessage: (state) => {
      state.quoteCreationResponse = null;  // Reset the success message
    }
  },
  extraReducers: (builder) => {
    // Handle fetchQuotesAsync actions
    builder
      .addCase(fetchQuotesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuotesAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { quotes, totalPages, currentPage } = action.payload;
        state.quotes = quotes;
        state.totalPages = totalPages;
        state.currentPage = currentPage;
      })
      .addCase(fetchQuotesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle createQuote actions
      .addCase(createQuote.pending, (state) => {
        state.loading = true; // Set loading true while creating a quote
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        const { message, quote_id, pdf_link } = action.payload; // Extract the message, quote_id, and pdf_link
        state.successMessage = message;  // Store the success message
        state.quoteId = quote_id;  // Store the quote ID
        state.pdfLink = pdf_link;  // Store the PDF link
        state.quoteCreationResponse = { message, pdf_link };  // Store the entire response
        state.loading = false; // Ensure loading is false
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSuccessMessage } = quoteSlice.actions;

export default quoteSlice.reducer;




