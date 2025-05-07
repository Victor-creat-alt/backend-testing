import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEmail } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginSignup.module.css';
import { loginUser, registerUser, verifyEmail } from '../redux/authActionsAdjusted';
import { setAuthToken } from '../redux/authSlice';
import { clearAuthError } from '../redux/errorSlice';

const AdjustedLoginSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { error: authError } = useSelector((state) => state.error);
    const [action, setAction] = useState('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        otp: '',
    });
    const [emailForVerification, setEmailForVerification] = useState('');

    // Determine user type from location state or default to 'client'
    const userType = location.state?.userType || 'client';

    // Dispatch setAuthToken when token changes
    useEffect(() => {
        if (token) {
            dispatch(setAuthToken(token));
        }
    }, [token, dispatch]);

    // Handle input changes for form fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        dispatch(clearAuthError()); // Clear any previous errors on input change
    };

    // Handle login submission for both clients and administrators
    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginUser(formData.email, formData.password, userType, navigate));
    };

    // Handle client registration only
    const handleRegistration = async (e) => {
        e.preventDefault();
        if (userType !== 'client') {
            return; // Prevent registration for administrators
        }
        dispatch(registerUser(formData.username, formData.email, formData.password, setEmailForVerification, setFormData, setAction));
    };

    // Handle email verification by button click with OTP input
    const handleVerification = async (e) => {
        e.preventDefault();
        dispatch(verifyEmail(emailForVerification, formData.otp, setFormData, setAction, navigate));
    };

    // Toggle between login and register actions for clients only
    const toggleAction = () => {
        if (userType === 'client') {
            setFormData({ username: '', email: '', password: '', otp: '' }); // Clear form data
            dispatch(clearAuthError()); // Clear any previous errors
            setAction(action === 'login' ? 'register' : 'login');
        }
    };

    return (
        <div className={styles['login-container']}>
            <div className={`${styles.wrapper} ${action === 'register' ? styles.active : ''}`}>
                {action === 'login' && (
                    <div className={styles['form-box'] + ' ' + styles.login}>
                        <form onSubmit={handleLogin}>
                            <h1>{userType === 'client' ? 'Client Login' : 'Administrator Login'}</h1>
                            {authError && <p className={styles['error-message']}>{authError}</p>}
                            <div className={styles['input-box']}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <MdEmail className={styles.icon} />
                            </div>
                            <div className={styles['input-box']}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <FaLock className={styles.icon} />
                            </div>
                            <button type="submit">Login</button>
                            {userType === 'client' && (
                                <>
                                    <div className={styles['forgot-password-link']} style={{ marginTop: '10px', fontSize: '0.9em' }}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/reset-password');
                                            }}
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className={styles['register-link']}>
                                        <p>
                                            Don't have an account?{' '}
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleAction();
                                                }}
                                            >
                                                Register
                                            </a>
                                        </p>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                )}

                {userType === 'client' && action === 'register' && (
                    <div className={styles['form-box'] + ' ' + styles.register}>
                        <form onSubmit={handleRegistration}>
                            <h1>Client Registration</h1>
                            {authError && <p className={styles['error-message']}>{authError}</p>}
                            <div className={styles['input-box']}>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <FaUser className={styles.icon} />
                            </div>
                            <div className={styles['input-box']}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <MdEmail className={styles.icon} />
                            </div>
                            <div className={styles['input-box']}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <FaLock className={styles.icon} />
                            </div>
                            <button type="submit">Register</button>
                            <div className={styles['register-link']}>
                                <p>
                                    Already have an account?{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleAction();
                                        }}
                                    >
                                        Login
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                )}

                {userType === 'client' && action === 'verify' && (
                    <div className={styles['form-box'] + ' ' + styles.verify}>
                        <form onSubmit={handleVerification}>
                            <h1>Email Verification</h1>
                            {authError && <p className={styles['error-message']}>{authError}</p>}
                            <p>Please enter the OTP sent to your email: <strong>{emailForVerification}</strong></p>
                            <div className={styles['input-box']}>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit">Verify Email</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdjustedLoginSignup;
