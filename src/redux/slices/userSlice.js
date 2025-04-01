import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// Async action to fetch users
export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('Access_Token');
    
    // Make the GET request with the Authorization header if token exists
    const response = await axios.get(`${API}/current_adebeo_users`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},  // Include token in the header
    });

    // Map the response to ensure we have the correct structure (username, role)
    const users = response.data.map(user => ({
      username: user.username,
      role: user.role,
    }));

    return users;  // Return the cleaned list of users
  } catch (error) {
    // Handle error
    throw new Error(error.response ? error.response.data.message : error.message);
  }
});

// Initial state for the slice
const initialState = {
  users: [],        // Store the list of users
  loading: false,   // Loading state
  error: null,      // Error state
};

// Creating the slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},  // Add additional reducers if you have other actions (not needed here)
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;  // When fetching starts, set loading to true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;  // Once data is fetched, set loading to false
        state.users = action.payload;  // Set the users state with the fetched users
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;  // If the fetch fails, set loading to false
        state.error = action.error.message;  // Store the error message
      });
  },
});

export default userSlice.reducer;
