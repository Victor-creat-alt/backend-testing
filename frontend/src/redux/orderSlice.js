import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:5000';

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || 'Failed to fetch orders');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const approveOrder = createAsyncThunk('orders/approveOrder', async (id, { dispatch, rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || 'Failed to approve order');
    }
    // Refresh orders after approval
    dispatch(fetchOrders());
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const disapproveOrder = createAsyncThunk('orders/disapproveOrder', async (id, { dispatch, rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/disapprove`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || 'Failed to disapprove order');
    }
    // Refresh orders after disapproval
    dispatch(fetchOrders());
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
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
