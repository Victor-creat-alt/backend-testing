import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Components/api/api'; // Import the shared api instance

// const API_BASE_URL = 'https://backend-testing-5o8c.onrender.com/service_requests/'; // No longer needed

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchServiceRequests',
  async (_, { rejectWithValue }) => {
    try {
      // Token handled by api instance interceptor
      const response = await api.get(`/service_requests/`); // Uses api instance
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch service requests');
    }
  }
);

export const createServiceRequest = createAsyncThunk(
  'serviceRequests/createServiceRequest',
  async ({ service_id, appointment_time }, { rejectWithValue }) => {
    try {
      // Token handled by api instance interceptor
      let adjustedAppointmentTime = appointment_time;
      if (!appointment_time) {
        adjustedAppointmentTime = new Date(Date.now() + 60000).toISOString();
      } else {
        const apptDate = new Date(appointment_time);
        if (apptDate <= new Date()) {
          adjustedAppointmentTime = new Date(Date.now() + 60000).toISOString();
        }
      }
      const payload = { service_id, appointment_time: adjustedAppointmentTime, status: 'pending' };
      const response = await api.post(`/service_requests/`, payload); // Uses api instance
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to create service request';
      if (error.response?.data) {
        if (error.response.data.validation_errors) {
          errorMessage = JSON.stringify(error.response.data.validation_errors);
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequests/updateServiceRequestStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Token handled by api instance interceptor
      const response = await api.put(`/service_requests/${id}/status`, { status }); // Uses api instance
      return response.data; // Assuming backend returns { id, status: data.status } or similar
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to update service request status');
    }
  }
);

const serviceRequestSlice = createSlice({
  name: 'serviceRequests',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const existingRequest = state.items.find((req) => req.id === id);
        if (existingRequest) {
          existingRequest.status = status;
        }
      });
  },
});

export default serviceRequestSlice.reducer;
