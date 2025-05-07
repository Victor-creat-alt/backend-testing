import axios from 'axios';
import { setAuthToken } from './authSlice';
import { setAuthError, clearAuthError } from './errorSlice';

const baseUrl = 'http://localhost:5000';

export const loginUser = (email, password, userType, navigate) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users/login`, { email, password });
        const { access_token } = response.data;
        if (access_token) {
            dispatch(setAuthToken({ token: access_token, userType }));
            alert('Successfully logged in.');
            if (userType === 'client') {
                navigate('/home');
            } else {
                navigate('/admin-dashboard');
            }
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

export const registerUser = (name, email, password, userType, setEmailForVerification, setFormData, setAction) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users`, { name, email, password });
        if (response.data.message) {
            // Removed alert here to prevent premature success message
            setEmailForVerification(email);
            setFormData({ username: '', email: '', password: '' });
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

// Modified action to verify email using token
// Added parameter 'shouldRedirect' to control redirect behavior
export const verifyEmail = (token, navigate, shouldRedirect = true) => async (dispatch) => {
    try {
        const response = await axios.get(`${baseUrl}/users/verify-email?token=${token}`);
        if (response.data.message === 'Email verified successfully.') {
            if (shouldRedirect) {
                alert('Email verified successfully. You can now log in.');
                navigate('/login');
            }
            return response.data;
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
            throw new Error('Email verification failed.');
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Email verification failed. Please try again.'));
        }
        throw error;
    }
};

// New action to reset password using token
export const resetPasswordWithToken = (token, newPassword, navigate) => async (dispatch) => {
    try {
        // Change newPassword key to new_password to match backend expected key
        const response = await axios.post(`${baseUrl}/users/reset-password`, { token, newPassword: newPassword });
        if (response.data.message === 'Password reset successful.') {
            alert('Password has been reset successfully. You can now log in.');
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
