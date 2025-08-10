import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

// ----------------------------------------
// Create a new user (Admin action)
// ----------------------------------------
export const addAdminUserAsync = createAsyncThunk(
  'adminUser/addUser',
  async ({ username, password, role }, thunkAPI) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) return thunkAPI.rejectWithValue("No access token found.");

    try {
      const response = await axios.post(
        `${API}/addusers`,
        {
          username: username.toLowerCase(),
          password,
          role, // "Admin", "User", or "Tech"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; // Adjust based on backend response
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ----------------------------------------
// Fetch all users (Admin list view)
// ----------------------------------------
export const fetchAllUsersAsync = createAsyncThunk(
  'adminUser/fetchAllUsers',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('Access_Token');
    if (!token) return thunkAPI.rejectWithValue("No access token found.");

    try {
      const response = await axios.get(`${API}/get_all_users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.users || []; // Adjust based on backend shape
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const adminUserSlice = createSlice({
  name: 'adminUser',
  initialState: {
    users: [],
    loading: false,
    error: null,
    addSuccess: false,
  },
  reducers: {
    resetAdminUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.addSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle user creation
      .addCase(addAdminUserAsync.pending, (state) => {
        state.loading = true;
        state.addSuccess = false;
        state.error = null;
      })
      .addCase(addAdminUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.addSuccess = true;
      })
      .addCase(addAdminUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.addSuccess = false;
        state.error = action.payload;
      })

      // Handle fetching all users
      .addCase(fetchAllUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminUserState } = adminUserSlice.actions;
export default adminUserSlice.reducer;
