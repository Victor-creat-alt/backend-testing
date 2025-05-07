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

export const registerUser = (name, email, password, setEmailForVerification, setFormData, setAction) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users`, { name, email, password });
        if (response.data.message) {
            alert('Registration successful. Please check your email to verify your account.');
            setEmailForVerification(email);
            setFormData({ name: '', email: '', password: '', otp: '' });
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

export const verifyEmail = (email, otp, setFormData, setAction, navigate) => async (dispatch) => {
    try {
        const response = await axios.post(`${baseUrl}/users/verify-otp`, { email, otp });
        if (response.data.message) {
            alert('Email verified successfully. You can now log in.');
            setFormData({ name: '', email: '', password: '', otp: '' });
            setAction('login');
            navigate('/login');
        } else {
            dispatch(setAuthError('Verification failed. Please try again.'));
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            dispatch(setAuthError(error.response.data.error));
        } else {
            dispatch(setAuthError('Verification failed. Please try again.'));
        }
    }
};
