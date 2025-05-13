import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
// import axios from 'axios'; // Will be replaced by the shared api instance
import api from '../Components/api/api'; // Import the shared api instance

const initialState = {
  services: [],
  selectedService: null,
  status: 'idle',
  error: null,
  selectedCategory: '',
  searchTerm: '',
  sortBy: 'price-asc',
};

export const fetchServices = createAsyncThunk('services/fetchServices', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/services'); // Use the shared api instance
    return response.data;
  } catch (error) {
    // Axios errors often have response.data for backend-specific messages
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch services');
  }
});

export const fetchServiceById = createAsyncThunk('services/fetchServiceById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/services/${id}`); // Use the shared api instance
    return response.data;
  } catch (error) {
    // Axios errors often have response.data for backend-specific messages
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch service');
  }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    resetFilters(state) {
      state.selectedCategory = '';
      state.searchTerm = '';
      state.sortBy = 'price-asc';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.selectedService = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.selectedService = null;
      });
  },
});

export const {
  setSelectedCategory,
  setSearchTerm,
  setSortBy,
  resetFilters,
} = servicesSlice.actions;

export default servicesSlice.reducer;

// Selectors
export const selectServicesState = (state) => state.services;

export const selectServices = createSelector(
  selectServicesState,
  (servicesState) => servicesState.services
);

export const selectAllServices = selectServices;

export const selectSelectedService = createSelector(
  selectServicesState,
  (servicesState) => servicesState.selectedService
);

export const selectCategories = createSelector(
  selectServices,
  (services) => {
    const categoriesSet = new Set(services.map(service => service.category));
    return Array.from(categoriesSet);
  }
);

export const selectSelectedCategory = createSelector(
  selectServicesState,
  (servicesState) => servicesState.selectedCategory
);

export const selectSearchTerm = createSelector(
  selectServicesState,
  (servicesState) => servicesState.searchTerm
);

export const selectSortBy = createSelector(
  selectServicesState,
  (servicesState) => servicesState.sortBy
);

export const selectServicesStatus = createSelector(
  selectServicesState,
  (servicesState) => servicesState.status
);

export const selectServicesError = createSelector(
  selectServicesState,
  (servicesState) => servicesState.error
);

export const selectServiceById = (state, serviceId) =>
  state.services.services.find(service => service.id === serviceId);

export const selectFilteredAndSortedServices = createSelector(
  selectServices,
  selectSelectedCategory,
  selectSearchTerm,
  selectSortBy,
  (services, selectedCategory, searchTerm, sortBy) => {
    let filtered = services;

    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(lowerSearchTerm) ||
        service.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    switch (sortBy) {
      case 'price-asc':
        filtered = filtered.slice().sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = filtered.slice().sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered = filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }
);
