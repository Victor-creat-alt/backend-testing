import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailCode } from '../redux/authActions';
import './EmailVerificationCode.css';

const EmailVerificationCode = ({ email }) => {
  const dispatch = useDispatch();
  const { error: authError } = useSelector((state) => state.error);
  const [code, setCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await dispatch(verifyEmailCode(email, code));
      setSuccessMessage('Email verified successfully. You can now log in.');
    } catch (err) {
      // error handled in redux
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="form-box email-verification">
        <form onSubmit={handleSubmit}>
          <h1>Email Verification</h1>
          <p>Please enter the verification code sent to your email.</p>
          <div className="input-box">
            <input
              type="text"
              name="code"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          {authError && <p className="error-message">{authError}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationCode;
