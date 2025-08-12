import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import API from '../../config/config';

const getAuthHeader = () => {
  const token = localStorage.getItem('Access_Token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add Combo Product
export const addComboAsync = createAsyncThunk(
  'combo/addCombo',
  async (comboData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/addComboProduct`, comboData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to add combo product'
      );
    }
  }
);

// Get All Combo Products
export const fetchCombosAsync = createAsyncThunk(
  'combo/fetchCombos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/getComboProducts`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch combo products'
      );
    }
  }
);

// Search Combos by Name
export const searchCombosByNameAsync = createAsyncThunk(
  'combo/searchCombosByName',
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/getComboProducts?name=${name}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to search combos'
      );
    }
  }
);

// Update Combo Product
export const updateComboAsync = createAsyncThunk(
  'combo/updateCombo',
  async ({ comboCode, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API}/updateComboProduct/${comboCode}`,
        updatedData,
        { headers: getAuthHeader() }
      );
      return { comboCode, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update combo'
      );
    }
  }
);

// Slice
const comboSlice = createSlice({
  name: 'combo',
  initialState: {
    combos: [],
    loading: false,
    error: null,
    successMessage: '',
  },
  reducers: {
    resetComboState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Combo
      .addCase(addComboAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = '';
      })
      .addCase(addComboAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Combo added';
      })
      .addCase(addComboAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Combos
      .addCase(fetchCombosAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCombosAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.combos = action.payload.data || [];
      })
      .addCase(fetchCombosAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search Combos
      .addCase(searchCombosByNameAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCombosByNameAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.combos = action.payload.data || [];
      })
      .addCase(searchCombosByNameAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Combo
      .addCase(updateComboAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = '';
      })
      .addCase(updateComboAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Combo updated';

        // Optionally update in-place if needed
        const index = state.combos.findIndex(
          (combo) => combo.comboCode === action.payload.comboCode
        );
        if (index !== -1) {
          state.combos[index] = {
            ...state.combos[index],
            ...action.meta.arg.updatedData,
          };
        }
      })
      .addCase(updateComboAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetComboState } = comboSlice.actions;
export default comboSlice.reducer;
