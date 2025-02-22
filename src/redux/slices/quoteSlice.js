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


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Import the Axios instance
import API from "../../config/config";  // Import the API URL

// Async action to fetch available quotes with pagination
export const fetchQuotesAsync = createAsyncThunk('quote/fetchQuotes', async ({ page, per_page }) => {
  try {
    const response = await axios.get(`${API}/get_quotes`, {
      params: { page, per_page },
    });
    return response.data; // Assuming the response contains quotes, totalPages, etc.
  } catch (error) {
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
  },
  reducers: {},
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
      .addCase(createQuote.fulfilled, (state, action) => {
        state.quotes.push(action.payload); // Add the newly created quote to the list
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default quoteSlice.reducer;



