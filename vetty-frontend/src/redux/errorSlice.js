// src/redux/errorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    error: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setAuthError: (state, action) => {
            state.error = action.payload;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
});

export const { setAuthError, clearAuthError } = errorSlice.actions;
export default errorSlice.reducer;