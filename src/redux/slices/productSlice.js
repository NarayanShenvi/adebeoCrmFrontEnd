
import { createSlice } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Axios instance
import API from "../../config/config";  // API URL

const initialState = {
  products: [],  // Stores all products
  productToEdit: null,  // Stores the selected product to be edited
  loading: false,
  error: null,
  comboProducts: [],   // Stores all combo products
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
    setComboProducts: (state, action) => {
    state.comboProducts = action.payload;
  },
  },
});


export const { setProducts, setLoading, setError, setProductToEdit, setComboProducts } = productSlice.actions;

export default productSlice.reducer;


export const fetchProductsAsync = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const token = localStorage.getItem('Access_Token');  // Get the token from localStorage
    
    const response = await axios.get(`${API}/getall_adebeo_products`, {
      headers: {
        Authorization: `Bearer ${token}`  // Attach the token to the request header
      }
    });

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
      dispatch(fetchProductsAsync()); // refresh products
      return { message: "Product updated successfully" }; // <-- return message
    } else {
      return { error: "Failed to update product" }; // <-- return error
    }
  } catch (error) {
    dispatch(setError('Failed to update product.'));
    return { error: error.response?.data?.error || error.message || "Update failed" };
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
      dispatch(fetchProductsAsync()); // refresh products
      return { message: "Product added successfully" };
    } else {
      return { error: "Failed to add product" };
    }
  } catch (error) {
    let errorMsg = "Failed to add product";

    if (error.response) {
      if (error.response.status === 409) {
        // Backend returns 409 Conflict if product exists
        errorMsg = "Product code already exists";
      } else if (error.response.data?.error) {
        errorMsg = error.response.data.error;
      }
    } else if (error.message) {
      errorMsg = error.message;
    }

    dispatch(setError(errorMsg));
    return { error: errorMsg };
  } finally {
    dispatch(setLoading(false));
  }
};


// Add combo product
export const addComboProductAsync = (payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('Access_Token');
    const response = await axios.post(`${API}/addComboProduct`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // ✅ If backend sends message, return it to the caller
    if (response.data?.message) {
      dispatch(fetchComboProductsAsync()); // Refresh combo list
      return { message: response.data.message };
    }

    // ✅ If backend sends error, return it to the caller
    if (response.data?.error) {
      return { error: response.data.error };
    }

    // Fallback if neither message nor error is given
    return { error: "Unknown response from server" };

  } catch (error) {
    const errMsg =
      error.response?.data?.error ||
      error.message ||
      "Failed to add combo product.";
    dispatch(setError(errMsg));
    return { error: errMsg };
  } finally {
    dispatch(setLoading(false));
  }
};


// Fetch combo products (optionally by name)
export const fetchComboProductsAsync = (name = '') => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('Access_Token');
    const response = await axios.get(`${API}/getComboProducts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: name ? { name } : {},
    });

    if (response && response.data) {
      const combos = response.data.data || [];
      dispatch(setComboProducts(combos));
      return combos; // allow component to use results
    }
    return [];
  } catch (error) {
    dispatch(setError('Failed to fetch combo products.'));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};


// Async Thunk to update a combo product (PUT)
export const updateComboProductAsync = (payload) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const token = localStorage.getItem('Access_Token');

    const response = await axios.put(
  `${API}/updateComboProduct/${payload.comboCode}`,
  payload,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
);
    console.log("Update Combo API response:", response);

    // ✅ success case
    if (response.data?.message) {
      dispatch(fetchComboProductsAsync()); // refresh combo list
      return { message: response.data.message };
    }

    // ❌ error case
    if (response.data?.error) {
      return { error: response.data.error };
    }

    return { error: "Unknown response from server" };

  } catch (error) {
    const errMsg =
      error.response?.data?.error ||
      error.message ||
      "Failed to update combo product.";
    dispatch(setError(errMsg));
    return { error: errMsg };
  } finally {
    dispatch(setLoading(false));
  }
};
