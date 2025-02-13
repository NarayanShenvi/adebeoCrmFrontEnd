import { createSlice } from "@reduxjs/toolkit"; 
import axios from "../../config/apiConfig";  
import API from "../../config/config";  

const initialState = {
  funnelData: [],
  customerComments: [],  // Ensure customerComments is initialized
  loading: false,
  error: null,
  modalState: {
    selectedShowCommentsCustomerId: null,
    selectedAddCommentCustomerId: null,
    showComments: false,
    addComment: false,
  }
};

const funnelSlice = createSlice({
  name: "funnel",
  initialState,
  reducers: {
    funnelCustomers: (state, action) => {
      state.funnelData = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCustomerComments: (state, action) => {
      state.customerComments = action.payload;  // Ensure the correct comments structure is stored
    },
    addCustomerComment: (state, action) => {
      state.customerComments.push(action.payload);
    },
    setModalState: (state, action) => {
      state.modalState = { ...state.modalState, ...action.payload };
    },
  },
});

export const { funnelCustomers, setLoading, setError, setCustomerComments, addCustomerComment,setModalState  } = funnelSlice.actions;
export default funnelSlice.reducer;

// Load funnel data
export const loadFunneldata = (page = 1, limit = 5, companyName = "") => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(`${API}/funnel_users`, {
        params: { page, limit, companyName },
      });
      if (response.data && response.data.data) {
        dispatch(funnelCustomers(response.data.data));
      }
    } catch (err) {
      dispatch(setError(err.message || "Error loading funnel data"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Load customer comments with the correct format based on API response
export const loadCustomerComments = (customerId) => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log(`Fetching comments for customerId: ${customerId}`);

      const response = await axios.get(`${API}/get_adebeo_customer_comments/${customerId}`);

      console.log("Fetched customer comments:", response.data);  // Log the full response

      if (response.data && response.data.comments) {
        // Map the comments correctly to the required format
        const mappedComments = response.data.comments.map((comment) => ({
          text: comment.comment,  // Mapping comment.text
          date: comment.date,      // Mapping comment.date
          name: comment.name,      // Mapping comment.name
        }));

        console.log("Mapped comments:", mappedComments);  // Log the mapped comments

        // Dispatch the mapped comments
        dispatch(setCustomerComments(mappedComments));
      } else {
        console.log("No comments found for this customer.");
      }
    } catch (err) {
      console.error("Error loading customer comments:", err);  // More detailed error logging
      dispatch(setError(err.message || "Error loading comments"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};



// Post a customer comment
export const postCustomerComment = (customerId, commentText) => {
  return async (dispatch) => {
    dispatch(setLoading(true));  // Set loading to true to show a loading state
    try {
      const payload = {
        comment: commentText,
        customer_id: customerId,  // customer_id instead of just customerId
      };
      const response = await axios.post(`${API}/create_adebeo_customer_comments`, payload); // Correct the URL format; // Pass payload to POST request
      
      if (response.data && response.data.comment) {
        dispatch(addCustomerComment(response.data.comment));  // Dispatch the new comment to Redux state
      }
    } catch (err) {
      dispatch(setError(err.message || "Error posting comment"));  // Handle error
    } finally {
      dispatch(setLoading(false));  // Set loading to false after the request is complete
    }
  };
};
