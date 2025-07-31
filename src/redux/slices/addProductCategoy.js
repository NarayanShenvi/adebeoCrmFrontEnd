import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// Async thunk to add a product category
export const addProductCategoryAsync = createAsyncThunk(
  'productCategory/addProductCategory',
  async (categoryData, thunkAPI) => {
    try {
      const token = localStorage.getItem('Access_Token');

      const response = await axios.post(
        `${API}/addcategory`,
        categoryData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return response.data; // expecting something like { message: "Category added successfully" }
    } catch (error) {
      // Throw error with backend message if available
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
);

const productCategorySlice = createSlice({
  name: 'productCategory',
  initialState: {
    loading: false,
    error: null,
    successMessage: '', // Store success message from API
    lastAddedCategory: null, // Optionally store the added category data or id
  },
  reducers: {
    resetSuccessMessage: (state) => {
      state.successMessage = '';
      state.error = null;
      state.lastAddedCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProductCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = '';
      })
      .addCase(addProductCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Category added successfully";
        state.lastAddedCategory = action.payload.category || null;  // optional
      })
      .addCase(addProductCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add category";
      });
  },
});

export const { resetSuccessMessage } = productCategorySlice.actions;

export default productCategorySlice.reducer;
