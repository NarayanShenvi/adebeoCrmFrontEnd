import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// Async thunk to add a product category
export const addProductCategoryAsync = createAsyncThunk(
  'productCategory/addProductCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('Access_Token');
      const response = await axios.post(
        `${API}/addcategory`,
        categoryData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data; // Backend should return { message: "...", category: {...} }
    } catch (error) {
      let msg = '';

      // Pass backend message if available
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      } else {
        msg = "Failed to add category";
      }

      return rejectWithValue(msg);
    }
  }
);

// Async thunk to fetch all categories
export const fetchCategoriesAsync = createAsyncThunk(
  'productCategory/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('Access_Token');
      const response = await axios.get(`${API}/getAllCategories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

const productCategorySlice = createSlice({
  name: 'productCategory',
  initialState: {
    loading: false,
    error: null,
    successMessage: '',
    lastAddedCategory: null,
    categories: [],
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
      // ADD CATEGORY
      .addCase(addProductCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = '';
      })
      .addCase(addProductCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Category added successfully";
        state.lastAddedCategory = action.payload.category || null;
      })
      .addCase(addProductCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add category";
      })

      // FETCH CATEGORIES
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const { resetSuccessMessage } = productCategorySlice.actions;
export default productCategorySlice.reducer;
