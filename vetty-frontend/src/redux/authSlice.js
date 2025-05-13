
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    userType: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthToken: (state, action) => {
            state.token = action.payload.token;
            state.userType = action.payload.userType;
        },
        clearAuthToken: (state) => {
            state.token = null;
            state.userType = null;
        },
        logout: (state) => {
            state.token = null;
            state.userType = null;
        },
    },
});

export const { setAuthToken, clearAuthToken, logout } = authSlice.actions;
export default authSlice.reducer;
