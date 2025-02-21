// import { createSlice } from '@reduxjs/toolkit';
// import axios from "../../config/apiConfig";  // Axios instance
// import API from "../../config/config";

// const initialState = {
//   products: [],  // Stores all products
//   loading: false,
//   error: null,
// };

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     setProducts: (state, action) => {
//       state.products = action.payload;
//     },
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//   },
// });

// export const { setProducts, setLoading, setError } = productSlice.actions;

// export default productSlice.reducer;

// // Async Thunk to fetch products
// export const fetchProductsAsync = () => async (dispatch) => {
//   dispatch(setLoading(true));

//   try {
//     const response = await axios.get(`${API}/getall_adebeo_products`);
//     console.log('API response:', response);  // Log the full API response
    
//     if (response && response.data && response.data.data) {
//       dispatch(setProducts(response.data.data));  // Set the full product data in the store
//     }
//   } catch (error) {
//     dispatch(setError('Failed to fetch products.'));
//   } finally {
//     dispatch(setLoading(false));
//   }
// };

import { createSlice } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Axios instance
import API from "../../config/config";  // API URL

const initialState = {
  products: [],  // Stores all products
  productToEdit: null,  // Stores the selected product to be edited
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
    setProductToEdit: (state, action) => {
      state.productToEdit = action.payload;
    },
  },
});

export const { setProducts, setLoading, setError, setProductToEdit } = productSlice.actions;

export default productSlice.reducer;

// Async Thunk to fetch all products
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

// Async Thunk to search for products by product name (GET)
export const searchProductsAsync = (productName) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await axios.get(`${API}/load_edit_adebeo_products`, {
      params: { productName },
    });
    console.log('Search API response:', response);
    
    if (response && response.data && response.data.data) {
      dispatch(setProducts(response.data.data));  // Set matching products in the store
    }
  } catch (error) {
    dispatch(setError('Failed to search for products.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Async Thunk to update a product (PUT)
export const updateProductAsync = (productData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await axios.put(`${API}/update_adebeo_product/${productData._id}`, productData);
    console.log('Update API response:', response);
    
    if (response.status === 200) {
      // Optionally, update the products list or just fetch updated products
      dispatch(fetchProductsAsync());  // Re-fetch products after update
    }
  } catch (error) {
    dispatch(setError('Failed to update product.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Async Thunk to add a new product (POST)
export const addProductAsync = (productData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await axios.post(`${API}/create_adebeo_products`, productData);
    console.log('Add API response:', response);
    
    if (response.status === 200) {
      // Optionally, update the products list
      dispatch(fetchProductsAsync());  // Re-fetch products after adding
    }
  } catch (error) {
    dispatch(setError('Failed to add product.'));
  } finally {
    dispatch(setLoading(false));
  }
};

