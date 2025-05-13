// frontend/src/Components/pages/Login/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEmail } from 'react-icons/md';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import './Login.css'; // Assuming styles can be shared or will be adjusted
import { registerUser, verifyOTP } from '../../../redux/authActions'; // verifyOTP might move if OTP is only post-login
import { clearAuthError, setAuthError } from '../../../redux/errorSlice';
import Input from '../../ui/Input';

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error: authError } = useSelector((state) => state.error);
    // State for registration form and OTP verification
    const [action, setAction] = useState('register'); // Default to register, can add 'verify'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        otp: '',
    });
    const [emailForVerification, setEmailForVerification] = useState('');
    const [userType] = useState('User');
    const [showPasswordRegister, setShowPasswordRegister] = useState(false);

    useEffect(() => {
        if (emailForVerification && action === 'verify') {
            alert("A verification email has been sent to " + emailForVerification + ". Please check your inbox.");
        }
    }, [emailForVerification, action]);
    
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        dispatch(clearAuthError());
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        if (userType !== 'User') { // This check might be redundant if this page is only for 'User' role
            dispatch(setAuthError('Registration for this user type is not allowed here.'));
            return;
        }
        if (!formData.username.trim()) {
            dispatch(setAuthError('Username is required.'));
            return;
        }
        if (!formData.email.trim()) {
            dispatch(setAuthError('Email is required.'));
            return;
        }
        if (!formData.password) {
            dispatch(setAuthError('Password is required.'));
            return;
        }
        dispatch(registerUser(formData.username, formData.email, formData.password, userType, setEmailForVerification, setFormData, setAction));
    };
    
    const handleVerification = async (e) => {
        e.preventDefault();
        if (!emailForVerification) {
            dispatch(setAuthError('Email for verification is missing. Please try registering again.'));
            setAction('register'); // Go back to register form
            return;
        }
        if (!formData.otp.trim()) {
            dispatch(setAuthError('OTP is required.'));
            return;
        }
        try {
            // Assuming verifyOTP action navigates on success or handles errors
            await dispatch(verifyOTP(emailForVerification, formData.otp, navigate)); 
            // On successful OTP verification, navigate to login
            // The verifyOTP action itself might navigate, or we can do it here based on its result.
            // For now, let's assume verifyOTP handles navigation or we add logic based on its success.
            // If verifyOTP doesn't navigate, we might do:
            // navigate('/login'); 
        } catch (error) {
            // Error should be handled by the verifyOTP thunk and set in authError
            console.error("Verification failed:", error);
        }
    };

    const toggleShowPasswordRegister = () => setShowPasswordRegister(!showPasswordRegister);

    return (
        <div className="login-root container"> {/* Consider renaming CSS class if styles diverge significantly */}
            <div className="card">
                {action === 'register' && (
                    <form className="form" onSubmit={handleRegistration}>
                        <h2>Register</h2>
                        {authError && <p className="error">{authError}</p>}
                        <div className="inputGroup">
                            <Input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <FaUser className="icon" />
                        </div>
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
                                type={showPasswordRegister ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <FaLock className="icon" />
                            <span
                                className="passwordToggle"
                                onClick={toggleShowPasswordRegister}
                                role="button"
                                tabIndex={0}
                                aria-label={showPasswordRegister ? 'Hide password' : 'Show password'}
                            >
                                {showPasswordRegister ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className="button" type="submit">
                            Register
                        </button>
                        <p className="link" style={{ marginTop: '15px', fontSize: '0.9em' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="link"> {/* Changed to Link */}
                                Login
                            </Link>
                        </p>
                    </form>
                )}

                {action === 'verify' && (
                    <form className="form" onSubmit={handleVerification}>
                        <h2>Email Verification</h2>
                        <p>Please enter the verification code sent to your email: {emailForVerification}</p>
                        {authError && <p className="error">{authError}</p>}
                        <div className="inputGroup">
                            <Input
                                type="text"
                                name="otp"
                                placeholder="Verification Code"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button className="button" type="submit">
                            Verify
                        </button>
                         <p className="link" style={{ marginTop: '15px', fontSize: '0.9em' }}>
                            Didn't receive code?{' '}
                            <span onClick={() => setAction('register')} className="link"> {/* Allow going back to register */}
                                Register again
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
