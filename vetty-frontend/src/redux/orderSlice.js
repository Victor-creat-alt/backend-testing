import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Components/api/api'; // Import the shared api instance

// const API_BASE_URL = 'https://backend-testing-5o8c.onrender.com'; // No longer needed, api instance handles base URL

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    // const token = localStorage.getItem('token'); // Token handled by api instance interceptor
    const response = await api.get(`/admin/orders`); // Uses api instance
    // if (!response.ok) { // Axios throws for non-2xx, error handled in catch
    //   const errorData = await response.json();
    //   return rejectWithValue(errorData.error || 'Failed to fetch orders');
    // }
    // const data = await response.json(); // Axios response.data is already JSON
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch orders');
  }
});

export const approveOrder = createAsyncThunk('orders/approveOrder', async (id, { dispatch, rejectWithValue }) => {
  try {
    // const token = localStorage.getItem('token'); // Token handled by api instance interceptor
    const response = await api.put(`/admin/orders/${id}/approve`); // Uses api instance
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return rejectWithValue(errorData.error || 'Failed to approve order');
    // }
    // Refresh orders after approval
    dispatch(fetchOrders());
    return response.data; // Assuming backend returns data, or just id if preferred
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Failed to approve order');
  }
});

export const disapproveOrder = createAsyncThunk('orders/disapproveOrder', async (id, { dispatch, rejectWithValue }) => {
  try {
    // const token = localStorage.getItem('token'); // Token handled by api instance interceptor
    const response = await api.put(`/admin/orders/${id}/disapprove`); // Uses api instance
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return rejectWithValue(errorData.error || 'Failed to disapprove order');
    // }
    // Refresh orders after disapproval
    dispatch(fetchOrders());
    return response.data; // Assuming backend returns data, or just id if preferred
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Failed to disapprove order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      .addCase(approveOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to approve order';
      })
      .addCase(disapproveOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disapproveOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(disapproveOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to disapprove order';
      });
  },
});

export default orderSlice.reducer;
