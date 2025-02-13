import { createSlice } from '@reduxjs/toolkit';
import axios from "../../config/apiConfig";  // Your axios instance with token
import API from "../../config/config";  // API path (for base URL or other configurations)

const initialState = {
  newCustomer: {
    companyName: '',
    ownerName: '',
    primaryEmail: '',
    mobileNumber: '',
  },
  selectedCustomer: null,
  customers: [],  // Stores all customers
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
  successMessage: '',  // Success message state for success feedback
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    resetNewCustomer: (state) => {
      state.newCustomer = {
        companyName: '',
        ownerName: '',
        primaryEmail: '',
        mobileNumber: '',
      };
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCreateLoading: (state, action) => {
      state.createLoading = action.payload;
    },
    setUpdateLoading: (state, action) => {
      state.updateLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCustomerList: (state, action) => {
      console.log('setCustomerList action received with data:', action.payload);
      state.customers = [...action.payload];  // Ensure a new array reference
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = '';  // Clear success message
    },
    clearError: (state) => {
      state.error = null;  // Clear error message
    },
  },
});

export const {
  resetNewCustomer,
  setSelectedCustomer,
  setLoading,
  setCreateLoading,
  setUpdateLoading,
  setError,
  setCustomerList,
  setSuccessMessage,
  clearSuccessMessage,
  clearError,
} = customerSlice.actions;

export default customerSlice.reducer;

// Async Thunks for API calls:

// Create a new customer (POST)
export const createCustomerAsync = (newCustomer) => async (dispatch) => {
  dispatch(setCreateLoading(true));  // Start loading for create
  console.log('Creating customer:', newCustomer);  // Log the new customer data

  try {
    const response = await axios.post(`${API}/create_adebeo_customers`, newCustomer);
    console.log('API response:', response);  // Log the full API response

    if (response && response.data) {
      const data = response.data;
      console.log('Response data:', data);  // Log the response data

      if (data.exists) {
        dispatch(setError(data.message));  // Handle error if email exists
        console.error('Error: ', data.message);  // Log error message
      } else {
        dispatch(setCustomerList((prevCustomers) => [...prevCustomers, data]));  // Add new customer
        dispatch(setSuccessMessage('Customer created successfully!'));
        dispatch(resetNewCustomer());  // Reset form state after successful creation
        console.log('Customer created successfully');  // Log success message
      }
    }
  } catch (error) {
    console.error('Error creating customer:', error);  // Log the error if the API call fails
    dispatch(setError('Failed to create customer.'));
  } finally {
    dispatch(setCreateLoading(false));  // End loading for create
    console.log('Finished creating customer, createLoading set to false');
  }
};

// Fetch customers based on company name (GET)
export const fetchCustomerAsync = (companyName) => async (dispatch) => {
  dispatch(setLoading(true));  // Start loading

  try {
    const response = await axios.get(`${API}/edit_adebeo_customer`, { params: { companyName } });
    console.log('API response:', response);  // Log the full API response

    if (response && response.data && response.data.data) {
      const customers = response.data.data;
      console.log('Fetched Customers:', customers); // Log the customers before dispatching

      if (Array.isArray(customers)) {
        dispatch(setCustomerList(customers));  // Update Redux state
        console.log('Customers set in Redux state:', customers);
      } else {
        console.error('No valid customers data:', customers);
        dispatch(setError('No customers found.'));
      }
    } else {
      console.error('Invalid response structure:', response);
      dispatch(setError('Invalid response structure.'));
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    dispatch(setError('Failed to fetch customers.'));
  } finally {
    dispatch(setLoading(false));  // End loading
    console.log('Finished fetching customers');
  }
};

// Update an existing customer (PUT)
export const updateCustomerAsync = (updatedCustomer) => async (dispatch) => {
  dispatch(setUpdateLoading(true));  // Start loading for update
  console.log('Updating customer with ID:', updatedCustomer.id);  // Log customer ID

  try {
    const response = await axios.put(`${API}/update_adebeo_customer/${updatedCustomer.id}`, updatedCustomer);
    
    if (response?.data) {
      console.log('Customer updated successfully:', response.data);  // Log the updated customer data
      dispatch(setSelectedCustomer(response.data));  // Update selected customer in Redux state
      dispatch(setSuccessMessage("Customer updated successfully!"));
    } else {
      console.error('No data returned for the update operation.');
      dispatch(setError('Failed to update customer.'));
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    dispatch(setError('Failed to update customer.'));
  } finally {
    dispatch(setUpdateLoading(false));  // End loading for update
    console.log('Finished updating customer, updateLoading set to false');
  }
};
