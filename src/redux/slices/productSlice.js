import { createSlice } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Axios instance
import API from "../../config/config";

const initialState = {
  products: [],  // Stores all products
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setProducts, setLoading, setError } = productSlice.actions;

export default productSlice.reducer;

// Async Thunk to fetch products
export const fetchProductsAsync = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await axios.get(`${API}/getall_adebeo_products`);
    console.log('API response:', response);  // Log the full API response
    
    if (response && response.data && response.data.data) {
      dispatch(setProducts(response.data.data));  // Set the full product data in the store
    }
  } catch (error) {
    dispatch(setError('Failed to fetch products.'));
  } finally {
    dispatch(setLoading(false));
  }
};
