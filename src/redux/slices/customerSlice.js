import { createSlice } from '@reduxjs/toolkit';
import API from '../../config/config'; // Your API configuration for backend calls

// Initial state
const initialState = {
  newCustomer: {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
  },
  selectedCustomer: null, // For selected customer (edit mode)
  loading: false,
  error: null,
};

// Slice creation
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    // Reset the newCustomer state when creating a new customer
    resetNewCustomer: (state) => {
      state.newCustomer = {
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
      };
    },

    // Update specific fields in the newCustomer state
    updateNewCustomerField: (state, action) => {
      const { field, value } = action.payload;
      state.newCustomer[field] = value;
    },

    // Set selected customer for editing
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
      // Populate newCustomer state with selected customer data when in edit mode
      state.newCustomer = {
        companyName: action.payload.companyName || '',
        contactName: action.payload.contactName || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
      };
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Create new customer - local handling (will be dispatched in async thunk)
    createCustomer: (state, action) => {
      // You can handle additional logic here for success or failure
    },

    // Update existing customer - local handling (will be dispatched in async thunk)
    updateCustomer: (state, action) => {
      // Action to handle customer update (in actual app, update state with response data)
    },

    // Fetch customer data by companyName for edit mode (local handling)
    fetchCustomer: (state, action) => {
      // Action to set selected customer
    },

    // Fetch customer list from API (for dropdown or customer selection purposes)
    fetchCustomerList: (state, action) => {
      // Handle fetching list of customers
    },
  },
});

// Async Thunks for API calls

// Create a new customer (POST)
export const createCustomerAsync = (newCustomer) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await API.post('/create_adebeo_customers', newCustomer); // Replace with your POST endpoint
    dispatch(createCustomer(response.data));  // Assuming response returns the created customer
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError('Failed to create customer'));
    dispatch(setLoading(false));
  }
};

// Fetch a customer (GET)
export const fetchCustomerAsync = (companyName) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await API.get(`/edit_adebeo_customer?companyName=${companyName}`); // Replace with GET endpoint
    dispatch(setSelectedCustomer(response.data));  // Assuming response contains customer data
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError('Failed to fetch customer data'));
    dispatch(setLoading(false));
  }
};

// Update an existing customer (PUT)
export const updateCustomerAsync = (updatedCustomer) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await API.put(`/update_adebeo_customer/${updatedCustomer.id}`, updatedCustomer); // Replace with PUT endpoint
    dispatch(updateCustomer(response.data));  // Assuming response contains updated customer data
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError('Failed to update customer'));
    dispatch(setLoading(false));
  }
};

// Export actions
export const {
  resetNewCustomer,
  updateNewCustomerField,
  setSelectedCustomer,
  setLoading,
  setError,
  createCustomer,
  updateCustomer,
  fetchCustomer,
  fetchCustomerList,
} = customerSlice.actions;

// Export reducer
export default customerSlice.reducer;
