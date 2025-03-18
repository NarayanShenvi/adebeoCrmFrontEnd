// import { createSlice } from '@reduxjs/toolkit';
// import axios from "../../config/apiConfig";  // Your axios instance with token
// import API from "../../config/config";  // API path (for base URL or other configurations)
// //import { fetchProductsAsync } from './productSlice';  // Import from the productSlice where you fetch the data

// const initialState = {
//   newCustomer: {
//     companyName: '',
//     ownerName: '',
//     primaryEmail: '',
//     mobileNumber: '',
//   },   
//   selectedCustomer: null,
//   customers: [],  // Stores all customers
//   customerComments: [], // Ensure this exists
//     modalState: {
//     showComments: false,
//     addComment: false,
//     selectedShowCommentsCustomerId: null,
//     selectedAddCommentCustomerId: null,
//   },  loading: false,
//   createLoading: false,
//   updateLoading: false,
//   error: null,
//   successMessage: '',  // Success message state for success feedback
//   productCodes: []  // Array to store only the product codes
// };

// const customerSlice = createSlice({
//   name: 'customers',
//   initialState,
//   reducers: {
//     resetNewCustomer: (state) => {
//       state.newCustomer = {
//         companyName: '',
//         ownerName: '',
//         primaryEmail: '',
//         mobileNumber: '',
//       };
//     },
//     setModalState: (state, action) => {
//       state.modalState = { ...state.modalState, ...action.payload };
//     },
//     setCustomerComments: (state, action) => {
//       state.customerComments = action.payload;  // Store fetched comments
//     },
//     addCustomerComment: (state, action) => {
//       state.customerComments.push(action.payload);  // Append new comment
//     },
//     clearCustomerComments: (state) => {
//       state.customerComments = [];  // Clear comments when switching customers
//     },
//     setProductCodes: (state, action) => {
//       state.productCodes = action.payload;  // Set productCodes from fetched products
//     },
//     setSelectedCustomer: (state, action) => {
//       state.selectedCustomer = action.payload;
//     },
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
//     setCreateLoading: (state, action) => {
//       state.createLoading = action.payload;
//     },
//     setUpdateLoading: (state, action) => {
//       state.updateLoading = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//     setCustomerList: (state, action) => {
//       console.log('setCustomerList action received with data:', action.payload);
//       state.customers = [...action.payload];  // Ensure a new array reference
//     },
//     setSuccessMessage: (state, action) => {
//       state.successMessage = action.payload;
//     },
//     clearSuccessMessage: (state) => {
//       state.successMessage = '';  // Clear success message
//     },
//     clearError: (state) => {
//       state.error = null;  // Clear error message
//     },
//     resetSelectedCustomer: (state) => {
//       state.selectedCustomer = null;  // Reset customer when toggling mode
//     },
//     clearCustomers(state) {
//       state.customers = [];  // Clears the customers list
//     },
//     extraReducers: (builder) => {
//       builder
//         .addCase(updateCustomerAsync.pending, (state) => {
//           state.createLoading = true;
//           state.error = null;
//         })
//         .addCase(updateCustomerAsync.fulfilled, (state, action) => {
//           state.createLoading = false;
//           state.selectedCustomer = action.payload;  // Update selectedCustomer with updated data
//           state.successMessage = action.payload.message;
//         })
//         .addCase(updateCustomerAsync.rejected, (state, action) => {
//           state.createLoading = false;
//           state.error = action.payload || 'Unknown error';
          
//           // Ensure the error doesn't reset selectedCustomer or form state.
//           console.error("Error during update:", action.payload || 'Unknown error');
//         });
//     }  
//     // other reducers
//   },
// });

// export const {
//   setCustomerComments,
//   addCustomerComment,
//   clearCustomerComments,
//   setModalState,
//   resetNewCustomer,
//   setSelectedCustomer,
//   setLoading,
//   setCreateLoading,
//   setUpdateLoading,
//   setError,
//   setCustomerList,
//   setSuccessMessage,
//   clearSuccessMessage,
//   clearError,
//   setProductCodes,
//   resetSelectedCustomer,clearCustomers
// } = customerSlice.actions;

// export default customerSlice.reducer;

// export const createCustomerAsync = (newCustomer) => async (dispatch) => {
//   dispatch(setCreateLoading(true));  // Start loading for create
//   console.log('Creating customer:', newCustomer);  // Log the new customer data

//   try {
//     const response = await axios.post(`${API}/create_adebeo_customers`, newCustomer);
//     console.log('API response:', response);  // Log the full API response

//     if (response && response.data) {
//       const data = response.data;  // Extract response data from API response
//       console.log('Response data:', data);  // Log the response data

//       if (data.success === false) {
//         // If success is false, handle the error response from the API
//         dispatch(setError(data.message));  // Dispatch the error message received from the backend
//         console.error('Error: ', data.message);  // Log the error message from the backend
//       } else {
//         // If success is true, add the customer to the state
//         dispatch(setCustomerList((prevCustomers) => [...prevCustomers, data]));  // Add new customer to the list
//         // Dispatch the success message correctly to Redux state
//         dispatch(setSuccessMessage(data.message || 'Customer created successfully!'));  // Use the message from API response
//         dispatch(resetNewCustomer());  // Reset the form after creation
//         console.log('Customer created successfully:', data);  // Log success message
//       }
//     }
//   } catch (error) {
//     // Only catch network or unexpected errors here (not when API explicitly returns success: false)
//     console.error('Error creating customer:', error);  // Log the error (this is for unexpected errors)

//     // Handle errors that occur during the API request itself (e.g., network issues)
//     dispatch(setError(error.response?.data?.message || 'An unexpected error occurred while creating the customer.'));
//   } finally {
//     // Ensure loading state is reset after the API call is completed (either success or error)
//     dispatch(setCreateLoading(false));  // End loading for create
//     console.log('Finished creating customer, createLoading set to false');
//   }
// };





// // Fetch customers based on company name (GET)
// export const fetchCustomerAsync = (companyName) => async (dispatch) => {
//   dispatch(setLoading(true));  // Start loading

//   try {
//     const response = await axios.get(`${API}/edit_adebeo_customer`, { params: { companyName } });
//     console.log('API response:', response);  // Log the full API response

//     if (response && response.data && response.data.data) {
//       const customers = response.data.data;
//       console.log('Fetched Customers:', customers); // Log the customers before dispatching

//       if (Array.isArray(customers)) {
//         dispatch(setCustomerList(customers));  // Update Redux state
//         console.log('Customers set in Redux state:', customers);
//       } else {
//         console.error('No valid customers data:', customers);
//         dispatch(setError('No customers found.'));
//       }
//     } else {
//       console.error('Invalid response structure:', response);
//       dispatch(setError('Invalid response structure.'));
//     }
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     dispatch(setError('Failed to fetch customers.'));
//   } finally {
//     dispatch(setLoading(false));  // End loading
//     console.log('Finished fetching customers');
//   }
// };

// // Update an existing customer (PUT)
// export const updateCustomerAsync = (updatedCustomer) => async (dispatch) => {
//   dispatch(setUpdateLoading(true));  // Start loading for update
//   console.log('Updating customer with ID:', updatedCustomer.id);  // Log customer ID

//   try {
//     const response = await axios.put(`${API}/update_adebeo_customer/${updatedCustomer.id}`, updatedCustomer);
//     console.log('Updating response:', response);

//     // Check if the response contains a message field
//     if (response?.data?.message) {
//       // Case when only a success message is returned
//       console.log('Customer update successful:', response.data.message);
      
//       // Since we don't have updated customer data, we set the success message
//       dispatch(setSuccessMessage(response.data.message));
      
//       // Optionally, you may want to update the selected customer with the latest known data (if not changing)
//       //dispatch(setSelectedCustomer(updatedCustomer));
//       return  response.data;
      
//     } else {
//       // If no message or customer data is returned, we treat it as a failure
//       console.error('No valid response data returned');
//       dispatch(setError('Failed to update customer.'));
//     }
//   } catch (error) {
//     console.error('Error updating customer:', error);
//     dispatch(setError('Failed to update customer.'));
//   } finally {
//     dispatch(setUpdateLoading(false));  // End loading for update
//     console.log('Finished updating customer, updateLoading set to false');
//   }
// };


// // Async Thunk to process product codes
// export const fetchProductsAsync = () => async (dispatch) => {
//   dispatch(setLoading(true));  // This shows the loading indicator
//   try {
//     const response = await axios.get(`${API}/getAll_adebeo_products`);
//     if (response && response.data && response.data.data) {
//       const productCodes = response.data.data.map(product => product.productCode);  // Extract only productCode from each product
//       dispatch(setProductCodes(productCodes));  // Dispatch only product codes to the Redux state
//     }
//   } catch (error) {
//     dispatch(setError('Failed to fetch products.'));
//   } finally {
//     dispatch(setLoading(false));  // This hides the loading indicator
//   }
// };
// export const loadCustomerComments = (customerId) => {
//   return async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//       const response = await axios.get(`${API}/get_adebeo_customer_comments/${customerId}`);
//       if (response.data && response.data.comments) {
//         const mappedComments = response.data.comments.map((comment) => ({
//           text: comment.comment,
//           date: comment.date,
//           name: comment.name,
//         }));
//         dispatch(setCustomerComments(mappedComments));
//       }
//     } catch (err) {
//       dispatch(setError(err.message || "Error loading comments"));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };

// // Post a customer comment
// export const postCustomerComment = (customerId, commentText) => {
//   return async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//       const payload = { comment: commentText, customer_id: customerId };
//       const response = await axios.post(`${API}/create_adebeo_customer_comments`, payload);
//       if (response.data && response.data.comment) {
//         dispatch(addCustomerComment(response.data.comment));
//       }
//     } catch (err) {
//       dispatch(setError(err.message || "Error posting comment"));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };

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
  customers: [],
  customerComments: [],
  modalState: {
    showComments: false,
    addComment: false,
    selectedShowCommentsCustomerId: null,
    selectedAddCommentCustomerId: null,
  },
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
  successMessage: '',
  productCodes: [],
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
    setModalState: (state, action) => {
      state.modalState = { ...state.modalState, ...action.payload };
    },
    setCustomerComments: (state, action) => {
      state.customerComments = action.payload;
    },
    addCustomerComment: (state, action) => {
      state.customerComments.push(action.payload);
    },
    clearCustomerComments: (state) => {
      state.customerComments = [];
    },
    setProductCodes: (state, action) => {
      state.productCodes = action.payload;
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
      state.customers = [...action.payload];
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearCustomers: (state) => {
      state.customers = [];
    }
  },
});

export const {
  setCustomerComments,
  addCustomerComment,
  clearCustomerComments,
  setModalState,
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
  setProductCodes,
  resetSelectedCustomer,
  clearCustomers
} = customerSlice.actions;

export default customerSlice.reducer;

// Add the async actions (thunks)

// Load customer comments for a specific customer
export const loadCustomerComments = (customerId) => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(`${API}/get_adebeo_customer_comments/${customerId}`);
      if (response.data && response.data.comments) {
        const mappedComments = response.data.comments.map((comment) => ({
          text: comment.comment,
          date: comment.date,
          name: comment.name,
        }));
        dispatch(setCustomerComments(mappedComments));
      }
    } catch (err) {
      dispatch(setError(err.message || "Error loading comments"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Post a new comment for a specific customer
export const postCustomerComment = (customerId, commentText) => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const payload = { comment: commentText, customer_id: customerId };
      const response = await axios.post(`${API}/create_adebeo_customer_comments`, payload);
      if (response.data && response.data.comment) {
        dispatch(addCustomerComment(response.data.comment));
      }
    } catch (err) {
      dispatch(setError(err.message || "Error posting comment"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Create a new customer (POST)
export const createCustomerAsync = (newCustomer) => async (dispatch) => {
  dispatch(setCreateLoading(true));  // Start loading for create
  try {
    const response = await axios.post(`${API}/create_adebeo_customers`, newCustomer);
    if (response && response.data) {
      const data = response.data;

      // Check for error or success status
      if (data.status === 'error' || data.success === false) {
        // Handle the error response from the API
        dispatch(setError(data.message || 'An error occurred while creating the customer.'));
      } else {
        // Add the new customer to the state
        dispatch(setCustomerList((prevCustomers) => [...prevCustomers, data]));
        dispatch(setSuccessMessage(data.message || 'Customer created successfully!'));
        dispatch(resetNewCustomer());
      }
    }
  } catch (error) {
    // Handle network or unexpected errors
    dispatch(setError(error.response?.data?.message));
  } finally {
    dispatch(setCreateLoading(false));  // End loading for create
  }
};

// Fetch customers based on company name (GET)
export const fetchCustomerAsync = (companyName) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${API}/edit_adebeo_customer`, { params: { companyName } });
    if (response && response.data && response.data.data) {
      const customers = response.data.data;
      dispatch(setCustomerList(customers));
    } else {
      dispatch(setError('No customers found.'));
    }
  } catch (error) {
    dispatch(setError('Failed to fetch customers.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Update an existing customer (PUT)
export const updateCustomerAsync = (updatedCustomer) => async (dispatch) => {
  dispatch(setUpdateLoading(true));
  try {
    const response = await axios.put(`${API}/update_adebeo_customer/${updatedCustomer.id}`, updatedCustomer);
    if (response?.data?.message) {
      dispatch(setSuccessMessage(response.data.message));
      return response.data;
    } else {
      dispatch(setError('Failed to update customer.'));
    }
  } catch (error) {
    dispatch(setError('Failed to update customer.'));
  } finally {
    dispatch(setUpdateLoading(false));
  }
};

// Async Thunk to process product codes
export const fetchProductsAsync = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${API}/getAll_adebeo_products`);
    if (response && response.data && response.data.data) {
      const productCodes = response.data.data.map(product => product.productCode);
      dispatch(setProductCodes(productCodes));
    }
  } catch (error) {
    dispatch(setError('Failed to fetch products.'));
  } finally {
    dispatch(setLoading(false));
  }
};


