import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:5000/service_requests/';

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchServiceRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch service requests');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createServiceRequest = createAsyncThunk(
  'serviceRequests/createServiceRequest',
  async ({ service_id, appointment_time }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // Adjust appointment_time to be 1 minute in the future if not provided or in the past
      let adjustedAppointmentTime = appointment_time;
      if (!appointment_time) {
        adjustedAppointmentTime = new Date(Date.now() + 60000).toISOString();
      } else {
        const apptDate = new Date(appointment_time);
        if (apptDate <= new Date()) {
          adjustedAppointmentTime = new Date(Date.now() + 60000).toISOString();
        }
      }
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ service_id, appointment_time: adjustedAppointmentTime, status: 'pending' }),
      });
      if (!response.ok) {
        let errorMessage = 'Failed to create service request';
        try {
          const errorData = await response.json();
          if (errorData && errorData.validation_errors) {
            errorMessage = JSON.stringify(errorData.validation_errors);
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // ignore JSON parse errors
        }
        return rejectWithValue(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequests/updateServiceRequestStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update service request status');
      }
      const data = await response.json();
      return { id, status: data.status };
    } catch (error) {
      return rejectWithValue(error.message);
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
