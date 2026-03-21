import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/apiConfig";
import API from "../../config/config";

/* --------------------------------
   FETCH RENEWAL REPORT
---------------------------------- */
export const fetchRenewalReport = createAsyncThunk(
  "renewal/fetchRenewalReport",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Access_Token");

      const params = {
        view: "REPORT",
        startDate,
        endDate,
      };

      console.log("Fetching RENEWAL report with params:", params);

      const response = await axios.get(`${API}/renewal_report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching renewal report:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch renewal report"
      );
    }
  }
);


/* --------------------------------
   POST RENEWAL COMMENT
---------------------------------- */
export const postRenewalComment = createAsyncThunk(
  "renewal/postRenewalComment",
  async ({ renewal_id, comment }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("Access_Token");

      const response = await axios.post(
        `${API}/add_renewal_comment`,
        {
          renewal_id,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add renewal comment"
      );
    }
  }
);

/* --------------------------------
   RENEWAL SLICE
---------------------------------- */
const renewalSlice = createSlice({
  name: "renewal",
  initialState: {
  renewalReports: [],
  totalCount: 0,
  view: null,
  renewalLoading: false,
  renewalError: null,
},


  reducers: {
    resetRenewalReport: (state) => {
  state.renewalReports = [];
  state.totalCount = 0;
  state.view = null;
  state.renewalLoading = false;
  state.renewalError = null;
},

  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchRenewalReport.pending, (state) => {
        console.log("Fetching RENEWAL report - Pending...");
        state.renewalLoading = true;
        state.renewalError = null;
      })

      .addCase(fetchRenewalReport.fulfilled, (state, action) => {
        console.log("Fetching RENEWAL report - Fulfilled", action.payload);

        state.renewalLoading = false;

        // API returns: { renewalReport: [...] }
        state.renewalReports = action.payload.renewalReport || [];
        state.totalCount = action.payload.totalCount || 0;
        state.view = action.payload.view || null;

      })

      .addCase(fetchRenewalReport.rejected, (state, action) => {
        console.log("Fetching RENEWAL report - Rejected", action.error.message);
        state.renewalLoading = false;
        state.renewalError =
          action.payload || action.error.message || "Unknown error";
      })

      .addCase(postRenewalComment.fulfilled, (state, action) => {
        if (action.payload?.comment) {
          state.renewalComments.push(action.payload.comment);
        }
      });
  },
});

export const { resetRenewalReport } = renewalSlice.actions;
export default renewalSlice.reducer;
