import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordWithToken } from '../redux/authActions';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { error: authError } = useSelector((state) => state.error);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenPresent, setTokenPresent] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (location.pathname === '/reset-password' && tokenParam) {
      setTokenPresent(true);
      setToken(tokenParam);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(resetPasswordWithToken(token, formData.newPassword, navigate));
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenPresent) {
    return (
      <div className="reset-password-container">
        <div className="form-box reset-password">
          <form onSubmit={handleSubmit}>
            <h1>Reset Password</h1>
            <p>Enter your new password to reset your password.</p>
            <div className="input-box">
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <FaLock className="icon" />
            </div>
            {error && <p className="error-message">{error}</p>}
            {authError && <p className="error-message">{authError}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="form-box reset-password">
        <form onSubmit={handleSubmit}>
          <h1>Reset Password</h1>
          <p>Enter your email and new password to reset your password.</p>
          <div className="input-box">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <FaLock className="icon" />
          </div>
          <div className="input-box">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <FaLock className="icon" />
          </div>
          {error && <p className="error-message">{error}</p>}
          {authError && <p className="error-message">{authError}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
