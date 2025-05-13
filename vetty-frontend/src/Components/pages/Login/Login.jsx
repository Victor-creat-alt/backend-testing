import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEmail } from 'react-icons/md';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import './Login.css';
import { loginUser } from '../../../redux/authActions';
import { setAuthToken } from '../../../redux/authSlice'; // Keep for potential direct token setting if needed
import { clearAuthError, setAuthError } from '../../../redux/errorSlice';
import Input from '../../ui/Input';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, userType: loggedInUserType } = useSelector((state) => state.auth);
    const { error: authError } = useSelector((state) => state.error);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [userType] = useState('User'); // Default to 'User' for login attempts from this page
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);

    useEffect(() => {
        if (token) {
            // Storing token and userType is good, navigation logic is also fine here.
            localStorage.setItem('token', token); 
            localStorage.setItem('userType', loggedInUserType); 
            if (loggedInUserType && loggedInUserType.toLowerCase() === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/home');
            }
        } else {
            // If no token, ensure redirect to login page
            navigate('/login');
        }
    }, [token, loggedInUserType, navigate]);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        dispatch(clearAuthError());
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.email.trim()) {
            dispatch(setAuthError('Email is required.'));
            return;
        }
        if (!formData.password) {
            dispatch(setAuthError('Password is required.'));
            return;
        }
        // Pass userType to loginUser. 'admin' login might need a different form or flag if UI differs.
        dispatch(loginUser(formData.email, formData.password, navigate, userType)); 
    };

    const toggleShowPasswordLogin = () => setShowPasswordLogin(!showPasswordLogin);

    return (
        <div className="login-root container">
            <div className="card">
                <form className="form" onSubmit={handleLogin}>
                    <h2>Login</h2>
                    {authError && <p className="error">{authError}</p>}
                    <div className="inputGroup">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <MdEmail className="icon" />
                    </div>
                    <div className="inputGroup" style={{ position: 'relative' }}>
                        <Input
                            type={showPasswordLogin ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <FaLock className="icon" />
                        <span
                            className="passwordToggle"
                            onClick={toggleShowPasswordLogin}
                            role="button"
                            tabIndex={0}
                            aria-label={showPasswordLogin ? 'Hide password' : 'Show password'}
                        >
                            {showPasswordLogin ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button className="button" type="submit">
                        Login
                    </button>
                    {/* Assuming 'User' is the primary role for this form. Admin login might be separate or handled by role detection on backend */}
                    <>
                        <p className="link" style={{ marginTop: '10px', fontSize: '0.9em' }}>
                            <Link to="/reset-password"> {/* Changed to Link */}
                                Forgot Password?
                            </Link>
                        </p>
                        <p className="link" style={{ marginTop: '15px', fontSize: '0.9em' }}>
                            Don't have an account?{' '}
                            <Link to="/register" className="link"> {/* Changed to Link */}
                                Register
                            </Link>
                        </p>
                    </>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
