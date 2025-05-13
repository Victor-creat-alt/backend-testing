import axios from 'axios';
import { setAuthToken, logout as logoutAuthSliceAction } from './authSlice'; // Import logout action from authSlice
import { setAuthError, clearAuthError } from './errorSlice';

const baseUrl = 'https://backend-testing-5o8c.onrender.com';

export const loginUser = (email, password, navigate, loginUserType) => async (dispatch) => {
    try {
        // Removed loginType from payload to align with API documentation
        const response = await axios.post(`${baseUrl}/auth/login`, { email, password }); 
        const { access_token, user } = response.data;
        if (access_token) {
            localStorage.setItem('token', access_token); // Save token to localStorage for persistence
            dispatch(setAuthToken({ token: access_token, userType: user?.role || 'User' })); // Store user role
            alert('Successfully logged in.');
            // Navigation will now happen in the Login component's useEffect
        } else {
            dispatch(setAuthError('Invalid credentials.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('An error occurred. Please try again.'));
        }
    }
};

// Action to handle user logout
export const performLogout = () => (dispatch) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType'); // Ensure userType is also cleared if stored
    dispatch(logoutAuthSliceAction()); // Dispatch the logout action from authSlice
    // Navigation to /login can be handled by components observing the auth state,
    // or explicitly here if a navigate function is passed and always desired.
};

export const registerUser = (name, email, password, userType, setEmailForVerification, setFormData, setAction) => async (dispatch) => {
    try {
        // Changed endpoint from /users to /auth/signup
        const response = await axios.post(`${baseUrl}/auth/signup`, { username: name, email, password, role: userType }); 
        if (response.data.message) {
            setEmailForVerification(email);
            setFormData({ name: '', email: '', password: '' });
            setAction('verify');
        } else {
            dispatch(setAuthError('Registration failed. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Registration failed. Please try again.'));
        }
    }
};

// New action to verify OTP for email verification
// Changed endpoint to /auth/verify-email and payload field from otp to code, as per checklist preference
export const verifyOTP = (email, otp, navigate) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/auth/verify-email`, { email, code: otp });
        if (response.data.message === 'Email verified successfully.') {
            alert('Email verified successfully. You can now log in.');
            navigate('/login');
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
        }
    }
};

// Deprecated verifyEmail action (optional to remove)
export const verifyEmail = (token, navigate) => async (dispatch) => {
    try {
        const response = await axios.get(`${baseUrl}/users/verify-email?token=${token}`);
        if (response.data.message === 'Email verified successfully.') {
            alert('Email verified successfully. You can now log in.');
            navigate('/login');
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
        }
    }
};

// New action to reset password using token and new password
export const resetPasswordWithToken = (token, newPassword, navigate) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users/password-reset-confirm`, { token, new_password: newPassword });
        if (response.data.message === 'Password has been reset successfully.') {
            alert('Password reset successful. You can now log in.');
            navigate('/login');
        } else {
            dispatch(setAuthError('Password reset failed. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Password reset failed. Please try again.'));
        }
    }
};

// New action to send password reset verification code email
export const sendPasswordResetVerificationCode = (email) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users/password-reset-request`, { email });
        if (response.data.message === 'Password reset email sent.') {
            alert('Verification code sent to your email.');
        } else {
            dispatch(setAuthError('Failed to send verification code. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Failed to send verification code. Please try again.'));
        }
    }
};
